"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartDataPoint } from "@/lib/prometheus/types"
import { cn } from "@/lib/utils"

interface MetricsCardProps {
    title: string;
    data: ChartDataPoint[];
    color?: string;
    className?: string;
    unit?: string;
}

export function MetricsCard({
    title,
    data,
    color = "#00ff9d", // Default Neon Green
    className,
    unit = ""
}: MetricsCardProps) {
    const currentValue = data.length > 0 ? data[data.length - 1].value.toFixed(1) : "N/A";

    return (
        <Card className={cn("overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl transition-all hover:bg-background/80 hover:shadow-[0_0_30px_-5px_var(--color-primary)] hover:border-primary group", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className="text-2xl font-bold text-primary font-mono glow-text">
                    {currentValue}{unit}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: '#737373' }}
                                tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                hide
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #262626',
                                    borderRadius: '4px',
                                    color: '#e0e0e0'
                                }}
                                labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fill={`url(#gradient-${title})`}
                                strokeWidth={2}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
