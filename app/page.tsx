import { transformMetric, checkHealth, transformMetricMap } from "@/lib/prometheus/client";
import { MetricsCard } from "@/components/ui/metrics-card";
import { ContainerSection } from "@/components/container-section";
import { fetchDashboardMetrics } from "@/lib/data/dashboard";
import { GithubActivityCard } from "@/components/ui/github-activity-card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { TimeRangeFilter } from "@/components/ui/time-range-filter"; // Import Filter
import { VPSSpecsCard } from "@/components/ui/vps-specs-card";
import { cn, maskContainerName } from "@/lib/utils";



interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range as string) || "1h";

  const now = Math.floor(Date.now() / 1000);
  let start = now - 3600;
  let step = 60;

  // Determine time range and step
  switch (range) {
    case "6h":
      start = now - (6 * 3600);
      step = 300; // 5 min resolution
      break;
    case "24h":
      start = now - (24 * 3600);
      step = 900; // 15 min resolution
      break;
    case "1h":
    default:
      start = now - 3600;
      step = 60; // 1 min resolution
      break;
  }

  // Fetch metrics in parallel
  // Fetch metrics using centralized service
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
    githubStats,
    isOnline
  } = await fetchDashboardMetrics(start, now, step);

  const cpuMetrics = transformMetric(cpuData);
  const ramMetrics = transformMetric(ramData);
  const diskMetrics = transformMetric(diskData);

  const requestMetrics = transformMetric(requestData);
  const connectionsMetrics = transformMetric(connectionsData);
  const errorMetrics = transformMetric(errorData);

  const dockerCpuMap = transformMetricMap(dockerCpuData);
  const dockerMemMap = transformMetricMap(dockerMemData);

  const odooMetrics = transformMetric(odooRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } });
  const wordpressMetrics = transformMetric(wordpressRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } });
  const portainerMetrics = transformMetric(portainerRpsData || { status: 'success', data: { resultType: 'matrix', result: [] } });


  // Transform container list for display
  const containerNames = containerListData.status === 'success' ? containerListData.data.result.map(r => r.metric.name || r.metric.image || "Unknown") : [];




  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-[95vw] mx-auto px-4 flex flex-wrap min-h-14 h-auto items-center justify-between py-2 gap-y-2">
          <div className="flex items-center mr-4">
            {/* Logo removed as requested */}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto sm:ml-0">
            {/* Filter integrated here */}
            <TimeRangeFilter />
            <ModeToggle />
            <nav className="flex items-center space-x-2 border-l border-white/10 pl-4 ml-2">
              <div className={cn(
                "h-2 w-2 rounded-full shadow-[0_0_10px]",
                isOnline ? "bg-[var(--primary)] shadow-[var(--primary)] animate-pulse" : "bg-red-500 shadow-red-500"
              )} />
              <span className={cn(
                "text-xs sm:text-sm font-medium font-mono hidden sm:inline-block",
                isOnline ? "text-[var(--primary)]" : "text-red-500"
              )}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[95vw] mx-auto px-4 py-10 space-y-12">

        {/* Section 1: System & Development */}
        <section className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl font-heading glitch-text" data-text="SYSTEM STATUS">
              SYSTEM STATUS
            </h1>
            <p className="text-muted-foreground font-mono">
              Real-time telemetry and infrastructure observability.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="md:col-span-2 xl:col-span-3">
              <GithubActivityCard data={githubStats} />
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl p-6 transition-all hover:bg-background/80 hover:border-primary hover:shadow-[0_0_30px_-5px_var(--color-primary)] group flex flex-col justify-center items-center h-full min-h-[200px]">
              <div className="text-5xl font-black text-primary mb-2 font-mono">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">System Uptime</div>
            </div>
          </div>
        </section>



        {/* Section 2: VPS Resources */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-muted-foreground font-heading border-b border-border/50 pb-2">
            VPS RESOURCES
          </h2>

          {/* New Infrastructure Specs Card */}
          <div className="mb-6">
            <VPSSpecsCard />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
              title="VPS CPU Usage"
              data={cpuMetrics}
              unit="%"
              color="#a855f7"
            />
            <MetricsCard
              title="RAM Usage"
              data={ramMetrics}
              unit="%"
              color="#ec4899"
            />
            <MetricsCard
              title="Disk Usage"
              data={diskMetrics}
              unit="%"
              color="#fbbf24"
            />
          </div>
        </section>
        {/* Section 3: Traefik Edge Router */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-muted-foreground font-heading border-b border-border/50 pb-2">
            TRAEFIK EDGE ROUTER
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
              title="Total Requests"
              data={requestMetrics}
              unit=" req/s"
              color="#00aaff"
            />
            <MetricsCard
              title="Active Connections"
              data={connectionsMetrics}
              unit=" conn"
              color="#38bdf8"
            />
            <MetricsCard
              title="5xx Errors"
              data={errorMetrics}
              unit=" err/s"
              color="#f43f5e"
            />
          </div>
        </section>

        {/* Section 4: Core Services */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-muted-foreground font-heading border-b border-border/50 pb-2">
            CORE SERVICES TRAFFIC
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MetricsCard
              title="Odoo ERP"
              data={odooMetrics}
              unit=" req/s"
              color="#8b5cf6"
            />
            <MetricsCard
              title="WordPress Store"
              data={wordpressMetrics}
              unit=" req/s"
              color="#3b82f6"
            />
            <MetricsCard
              title="Portainer"
              data={portainerMetrics}
              unit=" req/s"
              color="#10b981"
            />
          </div>
        </section>

        {/* Section 5: Container Infrastructure */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-muted-foreground font-heading border-b border-border/50 pb-2">
            CONTAINER INFRASTRUCTURE
          </h2>
          <ContainerSection
            rawCpu={dockerCpuMap}
            rawMem={dockerMemMap}
            containerNames={containerNames}
          />
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[95vw] mx-auto px-4 flex flex-col items-center justify-center gap-4 md:h-16">
            <p className="text-center text-sm leading-loose text-muted-foreground font-mono">
              POWERED BY NEXT.JS 16 + PROMETHEUS + TRAEFIK
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
