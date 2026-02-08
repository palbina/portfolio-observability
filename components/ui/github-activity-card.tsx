
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubStats } from "@/lib/github/client";
import { Activity, GitCommit } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, Tooltip, XAxis } from "recharts";

interface GithubActivityCardProps {
    data: GitHubStats;
}

export function GithubActivityCard({ data }: GithubActivityCardProps) {
    // Transform weeks data into a flat array of days for the last 30 days
    const flatDays = data.weeks
        .flatMap((w) => w.contributionDays)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

    // Calculate streak or max activity for fun?
    const maxContributions = Math.max(...flatDays.map(d => d.contributionCount));

    return (
        <Card className="border-border/50 bg-background/50 backdrop-blur-xl transition-all hover:bg-background/80 hover:shadow-[0_0_30px_-5px_var(--color-primary)] group border-github-primary hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-2">
                    <GitCommit className="h-4 w-4" />
                    Dev Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground group-hover:animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-mono tracking-tighter text-foreground">
                    {data.totalContributions}
                    <span className="text-xs text-muted-foreground ml-2 font-sans font-normal">contributions (last year)</span>
                </div>
                <div className="h-[80px] mt-4 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={flatDays}>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    color: "hsl(var(--foreground))",
                                    fontSize: "12px",
                                    borderRadius: "8px"
                                }}
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                            />
                            <Bar
                                dataKey="contributionCount"
                                fill="currentColor"
                                radius={[2, 2, 0, 0]}
                                className="fill-primary"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                    Latest: {flatDays[flatDays.length - 1]?.contributionCount || 0} commits today
                </p>
            </CardContent>
        </Card>
    );
}
