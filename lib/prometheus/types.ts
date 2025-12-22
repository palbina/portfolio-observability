export interface PrometheusMetric {
    metric: {
        [key: string]: string;
    };
    values: [number, string][]; // [timestamp, value]
}

export interface PrometheusResponse {
    status: "success" | "error";
    data: {
        resultType: "matrix" | "vector" | "scalar" | "string";
        result: PrometheusMetric[];
    };
}

export interface ChartDataPoint {
    time: number;
    value: number;
}
