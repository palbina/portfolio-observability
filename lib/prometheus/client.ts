import { PrometheusResponse, ChartDataPoint } from "./types";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || "http://localhost:9090";

export async function queryRange(
    query: string,
    start: number,
    end: number,
    step: number
): Promise<PrometheusResponse> {
    const params = new URLSearchParams({
        query,
        start: start.toString(),
        end: end.toString(),
        step: step.toString(),
    });

    try {
        const headers: HeadersInit = {};
        if (process.env.PROMETHEUS_USERNAME && process.env.PROMETHEUS_PASSWORD) {
            const auth = Buffer.from(
                `${process.env.PROMETHEUS_USERNAME}:${process.env.PROMETHEUS_PASSWORD}`
            ).toString("base64");
            headers["Authorization"] = `Basic ${auth}`;
        }

        const res = await fetch(`${PROMETHEUS_URL}/api/v1/query_range?${params}`, {
            headers,
            next: { revalidate: 30 }, // Cache for 30s
        });

        if (!res.ok) {
            throw new Error(`Prometheus API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        // Return empty mock structure on error to prevent UI crash during dev
        return { status: "error", data: { resultType: "matrix", result: [] } };
    }
}

export async function query(q: string): Promise<PrometheusResponse> {
    const params = new URLSearchParams({
        query: q,
        time: (Date.now() / 1000).toString(),
    });

    try {
        const headers: HeadersInit = {};
        if (process.env.PROMETHEUS_USERNAME && process.env.PROMETHEUS_PASSWORD) {
            const auth = Buffer.from(
                `${process.env.PROMETHEUS_USERNAME}:${process.env.PROMETHEUS_PASSWORD}`
            ).toString("base64");
            headers["Authorization"] = `Basic ${auth}`;
        }

        const res = await fetch(`${PROMETHEUS_URL}/api/v1/query?${params}`, {
            headers,
            next: { revalidate: 10 },
        });

        if (!res.ok) {
            throw new Error(`Prometheus API error: ${res.status} ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error("Failed to fetch instant metrics:", error);
        return { status: "error", data: { resultType: "vector", result: [] } };
    }
}

export async function checkHealth(): Promise<boolean> {
    try {
        // Simple query to check connectivity (up query is standard, or just check version)
        // Using query('up') is a good test.
        const res = await query('up');
        return res.status === 'success';
    } catch (e) {
        return false;
    }
}


export function transformMetric(response: PrometheusResponse): ChartDataPoint[] {
    if (response.status !== "success" || !response.data.result.length) {
        return [];
    }

    // Taking the first result series for simplicity
    const values = response.data.result[0].values;

    return values.map(([timestamp, value]) => ({
        time: timestamp * 1000, // Convert to ms
        value: parseFloat(value),
    }));
}

export function transformMetricMap(response: PrometheusResponse, label: string = "name"): Record<string, ChartDataPoint[]> {
    if (response.status !== "success" || !response.data.result.length) {
        return {};
    }

    const result: Record<string, ChartDataPoint[]> = {};

    response.data.result.forEach((series) => {
        // Fallback to 'image' if 'name' is empty/missing, or "Unknown"
        const key = series.metric[label] || series.metric["image"] || "Unknown";

        result[key] = series.values.map(([timestamp, value]) => ({
            time: timestamp * 1000,
            value: parseFloat(value),
        }));
    });

    return result;
}

export function aggregateMetric(response: PrometheusResponse): ChartDataPoint[] {
    if (response.status !== "success" || !response.data.result.length) {
        return [];
    }

    const result: ChartDataPoint[] = [];
    const valuesList = response.data.result.map(r => r.values);

    if (valuesList.length === 0) return [];

    // Assuming all series have same timestamps (aligned)
    const length = valuesList[0].length;

    for (let i = 0; i < length; i++) {
        let sum = 0;
        let time = 0;
        for (const values of valuesList) {
            if (values[i]) {
                sum += parseFloat(values[i][1]);
                time = values[i][0]; // Take timestamp from current
            }
        }
        if (time > 0) {
            result.push({
                time: time * 1000,
                value: sum
            });
        }
    }

    return result;
}
