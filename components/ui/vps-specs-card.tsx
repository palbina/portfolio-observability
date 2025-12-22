import { Server, Cpu, HardDrive, Share2, MapPin, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface VPSSpecsCardProps {
    className?: string;
}

export function VPSSpecsCard({ className }: VPSSpecsCardProps) {
    const specs = [
        {
            icon: Server,
            label: "Provider",
            value: "Hetzner Cloud CPX41",
            color: "text-blue-400"
        },
        {
            icon: Cpu,
            label: "Processor",
            value: "4 vCPU AMD EPYC™",
            color: "text-red-400"
        },
        {
            icon: Layers,
            label: "Memory",
            value: "16 GB DDR4 RAM",
            color: "text-purple-400"
        },
        {
            icon: HardDrive,
            label: "Storage",
            value: "150 GB NVMe SSD",
            color: "text-yellow-400"
        },
        {
            icon: Share2,
            label: "OS Kernel",
            value: "Ubuntu 24.04 (Linux 6.8)",
            color: "text-orange-400"
        },
        {
            icon: MapPin,
            label: "Region",
            value: "EU-Central (Nuremberg)",
            color: "text-green-400"
        }
    ];

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl p-6 shadow-sm transition-all hover:border-primary hover:shadow-[0_0_30px_-5px_var(--color-primary)]",
            className
        )}>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
                <h3 className="font-mono text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    INFRASTRUCTURE SPECIFICATIONS
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                {specs.map((spec) => (
                    <div key={spec.label} className="flex items-start gap-4 group">
                        <div className={cn("p-2 rounded-md bg-muted/30 border border-white/5 transition-colors group-hover:bg-muted/50", spec.color)}>
                            <spec.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-mono uppercase mb-1">
                                {spec.label}
                            </p>
                            <p className="font-semibold text-sm tracking-wide text-foreground group-hover:text-white transition-colors">
                                {spec.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                <Server size={120} strokeWidth={0.5} />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
    );
}
