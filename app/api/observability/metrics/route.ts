
import { type NextRequest, NextResponse } from "next/server";
import { transformMetric, aggregateMetric } from "@/lib/prometheus/client";
import { fetchDashboardMetrics } from "@/lib/data/dashboard";
import { maskContainerName } from "@/lib/utils";

export const dynamic = 'force-dynamic';

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
        const {
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
        } = await fetchDashboardMetrics(start, now, step);

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
                // Use aggregateMetric because the source data is detailed (per container)
                // but this API endpoint provides summary stats.
                cpu: aggregateMetric(dockerCpuData),
                memory: aggregateMetric(dockerMemData),
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
