
import { type NextRequest, NextResponse } from "next/server";
import { queryRange, query, checkHealth, transformMetric } from "@/lib/prometheus/client";

export const dynamic = 'force-dynamic'; // Defaults to auto, but we want to ensure it's dynamic for metrics

// Helper to mask sensitive container names (Moved from page.tsx to share logic if needed, or just duplicated here for the API)
function maskContainerName(name: string): string {
    const safeMap: Record<string, string> = {
        "odoo": "Odoo ERP Core",
        "wordpress": "WordPress Store",
        "traefik": "Traefik Proxy",
        "portainer": "Portainer Mgmt",
        "grafana": "Grafana Dashboards",
        "prometheus": "Prometheus DB",
        "cadvisor": "Container Advisor",
        "node-exporter": "Node Metrics",
        "loki": "Loki Logs",
        "postgres": "PostgreSQL DB",
        "redis": "Redis Cache",
        "minio": "Object Storage",
        "seaweedfs": "SeaweedFS"
    };

    const lowerName = name.toLowerCase();

    for (const [key, label] of Object.entries(safeMap)) {
        if (lowerName.includes(key)) {
            return label; // Return pretty name if matched
        }
    }

    // Deterministic ID
    const id = Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 31).toString(16).substring(0, 4).toUpperCase();
    return `SECURE-MODULE-0x${id}`;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "1h";

    const now = Math.floor(Date.now() / 1000);
    let start = now - 3600;
    let step = 60;

    switch (range) {
        case "6h":
            start = now - (6 * 3600);
            step = 300;
            break;
        case "24h":
            start = now - (24 * 3600);
            step = 900;
            break;
        case "1h":
        default:
            start = now - 3600;
            step = 60;
            break;
    }

    try {
        const [
            cpuData,
            ramData,
            diskData,
            requestData,
            connectionsData,
            errorData,
            dockerCpuData,
            dockerMemData,
            containerCountData,
            containerListData,
            odooRpsData,
            wordpressRpsData,
            portainerRpsData,
            isOnline
        ] = await Promise.all([
            // System
            queryRange('100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)', start, now, step),
            queryRange('((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100', start, now, step),
            queryRange('100 - ((node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}) * 100)', start, now, step),

            // Traefik
            queryRange('sum(rate(traefik_entrypoint_requests_total[5m]))', start, now, step),
            queryRange('sum(traefik_open_connections)', start, now, step),
            queryRange('sum(rate(traefik_entrypoint_requests_total{code=~"5.."}[5m]))', start, now, step),

            // Docker
            queryRange('sum(rate(container_cpu_usage_seconds_total{image!=""}[5m])) * 100', start, now, step),
            queryRange('sum(container_memory_usage_bytes{image!=""}) / 1024 / 1024 / 1024', start, now, step),
            queryRange('count(container_last_seen{image!=""})', start, now, step),

            // Instant list
            query('container_last_seen{image!=""}'),

            // Services
            queryRange('sum(rate(traefik_service_requests_total{service=~".*odoo.*"}[5m]))', start, now, step),
            queryRange('sum(rate(traefik_service_requests_total{service=~".*wordpress.*"}[5m]))', start, now, step),
            queryRange('sum(rate(traefik_service_requests_total{service=~".*portainer.*"}[5m]))', start, now, step),

            // Health
            checkHealth(),
        ]);

        // Transform data
        const metrics = {
            system: {
                cpu: transformMetric(cpuData),
                ram: transformMetric(ramData),
                disk: transformMetric(diskData),
                isOnline
            },
            traefik: {
                requests: transformMetric(requestData),
                connections: transformMetric(connectionsData),
                errors: transformMetric(errorData),
            },
            docker: {
                cpu: transformMetric(dockerCpuData),
                memory: transformMetric(dockerMemData),
                countMetrics: transformMetric(containerCountData), // Time series count
            },
            services: {
                odoo: transformMetric(odooRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } }),
                wordpress: transformMetric(wordpressRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } }),
                portainer: transformMetric(portainerRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } }),
            },
            containers: {
                count: 0,
                list: [] as string[]
            }
        };

        // Process container list
        const rawContainerNames = containerListData.status === 'success' ? containerListData.data.result.map(r => r.metric.name || r.metric.image || "Unknown") : [];
        metrics.containers.count = rawContainerNames.length;
        metrics.containers.list = rawContainerNames.map(maskContainerName);

        return NextResponse.json(metrics);

    } catch (error) {
        console.error("Error fetching metrics:", error);
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}
