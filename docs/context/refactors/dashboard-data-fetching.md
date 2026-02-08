# Refactor: Dashboard Data Fetching & Reliability

**Type**: Refactor
**Date**: 2026-02-08
**Status**: Complete

## Overview

Centralized data fetching logic for the dashboard and API into a shared service, implemented server-side metric aggregation, and improved application reliability with timeouts and health checks.

## Problem/Goal

- **Duplication**: Data fetching logic was duplicated between `app/page.tsx` (RSC) and `app/api/observability/metrics/route.ts` (API).
- **Inefficiency**: Docker metrics were processed client-side or re-fetched inefficiently.
- **Reliability**: GitHub API calls could hang indefinitely, blocking rendering. Recharts sometimes crashed due to undefined dimensions.
- **Build/Deploy**: Python virtual environment files were breaking the Docker build.

## Solution/Implementation

1. **Centralized Service**: Created `lib/data/dashboard.ts` with `fetchDashboardMetrics` to handle all Prometheus and GitHub queries in parallel.
2. **Server-Side Aggregation**: Added `aggregateMetric` to `lib/prometheus/client.ts` to sum Docker CPU/Memory usage on the server, simplifying the API response.
3. **Health Check**: Added `/api/health` for Kubernetes liveness/readiness probes.
4. **Reliability Fixes**:
    - Wrapped GitHub API calls in `AbortController` with a 3s timeout.
    - Added `minWidth={0}` and `minHeight={0}` to Recharts `ResponsiveContainer`.
5. **Build Fixes**: Added `.venv` to `.gitignore` to unblock Docker builds.
6. **Optimization**: Added `sharp` for image optimization and `display: "swap"` for fonts.

## Code Changes

- **Modified**: `app/page.tsx` - Now uses `fetchDashboardMetrics`.
- **Modified**: `app/api/observability/metrics/route.ts` - Now uses `fetchDashboardMetrics` and `aggregateMetric`.
- **New**: `lib/data/dashboard.ts` - The centralization point.
- **Modified**: `lib/prometheus/client.ts` - Added helper function.
- **New**: `app/api/health/route.ts` - Simple JSON response.
- **Modified**: `lib/github/client.ts` - Added timeout logic.
- **Modified**: `components/ui/github-activity-card.tsx` - Added chart constraints.
- **Modified**: `next.config.ts`, `app/layout.tsx` - Optimizations.

## Key Decisions

- **Shared Fetching**: Moving logic to `lib/data` ensures consistent data between the UI (SSR) and external API consumers.
- **Fail-Fast**: GitHub API failure shouldn't crash the dashboard; now it returns mock data or handles errors gracefully after 3s.
- **Server Aggregation**: Calculating totals on the server reduces payload size and client computation.

## Tradeoffs

- **Pros**: Cleaner codebase (DRY), better performance (server aggregation), higher stability (timeouts).
- **Cons**: Slightly increased complexity in `lib/data` due to centralized types.

## Related Files

- `lib/data/dashboard.ts`
- `app/page.tsx`
- `app/api/observability/metrics/route.ts`
- `lib/prometheus/client.ts`

## Testing / Verification

- [x] Dashboard loads correctly with data.
- [x] API endpoint returns aggregated metrics.
- [x] Health check returns 200 OK.
- [x] GitHub API handles errors gracefully (simulated).
- [x] Docker build succeeds.
