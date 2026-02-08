
import { queryRange, query, checkHealth, transformMetric, transformMetricMap } from "@/lib/prometheus/client";
import { fetchGitHubStats } from "@/lib/github/client";
import { ChartDataPoint } from "@/lib/prometheus/types";

export interface DashboardMetrics {
    cpuMetrics: ChartDataPoint[];
    ramMetrics: ChartDataPoint[];
    diskMetrics: ChartDataPoint[];
    requestMetrics: ChartDataPoint[];
    connectionsMetrics: ChartDataPoint[];
    errorMetrics: ChartDataPoint[];
    dockerCpuMap: Record<string, ChartDataPoint[]>;
    dockerMemMap: Record<string, ChartDataPoint[]>;
    containerNames: string[];
    odooMetrics: ChartDataPoint[];
    wordpressMetrics: ChartDataPoint[];
    portainerMetrics: ChartDataPoint[];
    githubStats: any; // Ideally should be typed
    isOnline: boolean;
    containerCountData: PrometheusResponse; // Keep raw for now or transform?
    // We'll expose raw responses for consistency with page.tsx logic
    containerListData: PrometheusResponse;
}

// Re-export type if needed or import
interface PrometheusResponse {
    status: "success" | "error";
    data: {
        resultType: "matrix" | "vector" | "scalar" | "string";
        result: any[];
    };
}

export async function fetchDashboardMetrics(start: number, now: number, step: number) {
    // Fetch metrics in parallel
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
        githubStats,
        isOnline
    ] = await Promise.all([
        // System (Node Exporter)
        queryRange('100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)', start, now, step),
        queryRange('((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100', start, now, step),
        queryRange('100 - ((node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"}) * 100)', start, now, step),

        // Traefik Global
        queryRange('sum(rate(traefik_entrypoint_requests_total[5m]))', start, now, step),
        queryRange('sum(traefik_open_connections)', start, now, step), // Active Connections
        queryRange('sum(rate(traefik_entrypoint_requests_total{code=~"5.."}[5m]))', start, now, step), // 5xx Errors

        // Docker (cAdvisor)
        queryRange('rate(container_cpu_usage_seconds_total{image!=""}[5m]) * 100', start, now, step),
        queryRange('container_memory_usage_bytes{image!=""} / 1024 / 1024 / 1024', start, now, step),
        queryRange('count(container_last_seen{image!=""})', start, now, step),

        // Instant list of containers (New)
        query('container_last_seen{image!=""}'),

        // Specific Services (Traefik Service Labels)
        // Using Regex ( =~ ) to catch variations like odoo@docker, odoo-svc, etc.
        queryRange('sum(rate(traefik_service_requests_total{service=~".*odoo.*"}[5m]))', start, now, step),
        queryRange('sum(rate(traefik_service_requests_total{service=~".*wordpress.*"}[5m]))', start, now, step),
        queryRange('sum(rate(traefik_service_requests_total{service=~".*portainer.*"}[5m]))', start, now, step),

        // GitHub Stats
        fetchGitHubStats("palbina"),

        // Health Check
        checkHealth(),
    ]);

    return {
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
        githubStats,
        isOnline
    };
}
