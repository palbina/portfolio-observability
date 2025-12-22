import { cn } from "@/lib/utils";

interface ContainerListProps {
    containers: string[];
    total: number;
    className?: string;
    onSelect?: (container: string) => void;
    selectedContainer?: string | null;
}

export function ContainerList({ containers, total, className, onSelect, selectedContainer }: ContainerListProps) {
    // Filter out noise/internal containers if needed, or show all
    // Sorting alphabetically
    const sortedContainers = [...containers].sort();

    return (
        <div className={cn("relative overflow-hidden rounded-xl border border-border/50 bg-background/50 text-card-foreground backdrop-blur-xl shadow-sm transition-all hover:bg-background/80 hover:border-primary hover:shadow-[0_0_30px_-5px_var(--color-primary)] group md:col-span-1 flex flex-col h-[300px]", className)}>
            <div className="p-6 pb-2 border-b border-border bg-muted/20">
                <h3 className="font-mono text-sm font-bold tracking-widest text-muted-foreground uppercase mb-1">
                    ACTIVE CONTAINERS
                </h3>
                <div className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">
                    {total}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {sortedContainers.map((name, index) => {
                    const isSelected = selectedContainer === name;
                    return (
                        <div
                            key={`${name}-${index}`}
                            onClick={() => onSelect?.(name)}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-md transition-colors border border-transparent cursor-pointer",
                                isSelected
                                    ? "bg-primary/20 border-primary/50 text-primary"
                                    : "bg-muted/40 hover:bg-muted/80 hover:border-primary/30"
                            )}
                        >
                            <div className={cn(
                                "h-2 w-2 rounded-full shadow-[0_0_8px_#22c55e]",
                                isSelected ? "bg-primary shadow-[0_0_10px_var(--color-primary)]" : "bg-green-500"
                            )} />
                            <span className={cn(
                                "font-mono text-xs truncate font-medium transition-colors",
                                isSelected ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                            )} title={name}>
                                {name}
                            </span>
                        </div>
                    )
                })}
                {sortedContainers.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-10 font-mono">
                        Scanning for containers...
                    </p>
                )}
            </div>

            {/* Decorative effect - only for dark mode via CSS override or class */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none opacity-0 dark:opacity-100" />
        </div>
    );
}
