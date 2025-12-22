"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TimeRangeFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    // Default to '1h' if not present
    const currentRange = searchParams.get("range") || "1h"

    // Helper to update query string
    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }

    const ranges = [
        { label: "1H", value: "1h" },
        { label: "6H", value: "6h" },
        { label: "24H", value: "24h" },
    ]

    return (
        <div className="flex items-center bg-muted/20 p-1 rounded-lg border border-border/40 backdrop-blur-sm">
            {ranges.map((range) => (
                <Button
                    key={range.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 px-3 text-xs font-mono transition-all rounded-md data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50 data-[state=active]:border",
                        currentRange === range.value
                            ? "bg-background text-primary shadow-sm border border-border/50 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                    onClick={() => {
                        // Use scroll: false to prevent scrolling to top on change
                        router.push(pathname + "?" + createQueryString("range", range.value), { scroll: false })
                    }}
                >
                    {range.label}
                </Button>
            ))}
        </div>
    )
}
