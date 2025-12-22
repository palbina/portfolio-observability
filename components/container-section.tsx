"use client"

import { useState, useMemo } from "react";
import { ContainerList } from "@/components/ui/container-list";
import { MetricsCard } from "@/components/ui/metrics-card";
import { ChartDataPoint } from "@/lib/prometheus/types";
import { maskContainerName } from "@/lib/utils";

interface ContainerSectionProps {
    // Raw metrics keyed by original container name
    rawCpu: Record<string, ChartDataPoint[]>;
    rawMem: Record<string, ChartDataPoint[]>;
    // List of original container names from discovery
    containerNames: string[];
}

export function ContainerSection({ rawCpu, rawMem, containerNames }: ContainerSectionProps) {
    const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

    // Prepare display list and mapping
    // We memoize this to avoid re-calculating on every render
    const { displayNames, nameMap } = useMemo(() => {
        const map = new Map<string, string>(); // Display -> Original
        const reverseMap = new Map<string, string>(); // Original -> Display
        const list: string[] = [];

        containerNames.forEach(name => {
            const masked = maskContainerName(name);
            map.set(masked, name);
            reverseMap.set(name, masked);
            list.push(masked);
        });

        return { displayNames: list, nameMap: map, reverseMap };
    }, [containerNames]);

    const handleSelect = (maskedName: string) => {
        // Toggle selection
        if (selectedContainer === maskedName) {
            setSelectedContainer(null);
        } else {
            setSelectedContainer(maskedName);
        }
    };

    // Compute Chart Data
    const charts = useMemo(() => {
        // If a container is selected, return its specific data
        if (selectedContainer) {
            const originalName = nameMap.get(selectedContainer);
            if (originalName) {
                return {
                    cpu: rawCpu[originalName] || [],
                    mem: rawMem[originalName] || [],
                    cpuTitle: `CPU: ${selectedContainer}`,
                    memTitle: `MEM: ${selectedContainer}`
                };
            }
        }

        // Otherwise, Aggregate (Sum) all available data
        // We assume all series have similar timestamps (aligned by Prometheus step)
        // We'll iterate through the first series timestamps and sum up others matching it
        const firstKey = Object.keys(rawCpu)[0];
        if (!firstKey) return { cpu: [], mem: [], cpuTitle: "Docker CPU Load", memTitle: "Docker Memory" };

        const timestamps = rawCpu[firstKey].map(p => p.time);
        const aggCpu: ChartDataPoint[] = [];
        const aggMem: ChartDataPoint[] = [];

        timestamps.forEach((t, index) => {
            let sumCpu = 0;
            let sumMem = 0;

            // Iterate all containers to sum values at this index
            // IMPORTANT: This assumes data is aligned. query_range usually aligns.
            Object.keys(rawCpu).forEach(key => {
                if (rawCpu[key][index]) sumCpu += rawCpu[key][index].value;
                if (rawMem[key] && rawMem[key][index]) sumMem += rawMem[key][index].value;
            });

            aggCpu.push({ time: t, value: sumCpu });
            aggMem.push({ time: t, value: sumMem });
        });

        return {
            cpu: aggCpu,
            mem: aggMem,
            cpuTitle: "Docker CPU Load",
            memTitle: "Docker Memory"
        };

    }, [selectedContainer, rawCpu, rawMem, nameMap]);


    return (
        <div className="flex flex-wrap gap-6 justify-center">
            <ContainerList
                containers={displayNames}
                total={displayNames.length}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]"
                onSelect={handleSelect}
                selectedContainer={selectedContainer}
            />
            <MetricsCard
                title={charts.cpuTitle}
                data={charts.cpu}
                unit="%"
                color="#c084fc"
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]"
            />
            <MetricsCard
                title={charts.memTitle}
                data={charts.mem}
                unit=" GB"
                color="#e879f9"
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)]"
            />
        </div>
    );
}
