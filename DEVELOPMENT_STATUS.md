# 🚀 Portfolio Observability - Development Status

**Last Updated:** December 20, 2025
**Version:** 0.2.0 (Enhanced UI & Features)

## 📋 Overlay

This project is a "Living Portfolio" built with Next.js 15+ that showcases real-time infrastructure metrics from the developer's VPS. It demonstrates proficiency in **Full Stack Development**, **DevOps**, and **Observability**.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Core**: React 19 (Latest)
- **Styling**: Tailwind CSS v3 (+ tailwindcss-animate)
- **Design System**:
  - **Fonts**: Orbitron (Headings), JetBrains Mono (Data/Code)
  - **Aesthetics**: Premium Cyberpunk/Neon (Dark Mode) vs Clean Corporate (Light Mode)
- **Data Source**:
  - **Prometheus**: Real-time infrastructure metrics
  - **GitHub GraphQL API**: Development activity & contribution stats
- **Deployment**: Kubernetes (Production) / Docker Compose (Local)

## ✨ Features Implemented

### 1. Unified Dashboard (`app/page.tsx`)

Organized into logical sections with a responsive grid layout:

- **System Status**: **[DONE]** Real-time connectivity check:
  - **Dynamic Status**: Queries Prometheus `up` metric to toggle line/offline status.
  - **Public API**: `/api/observability/metrics` exposed for external consumers (e.g. main portfolio) via Traefik Middleware (CORS enabled).
  - **Cyberpunk Header**: "SYSTEM STATUS" title features a premium cyberpunk aesthetic with theme-aware animated text shadows (Neon in Dark Mode, Contrast in Light Mode).
- **GitHub Activity**: **[NEW]** Real-time coding stats (contributions, streaks) fetched via GraphQL.
- **VPS Resources**: CPU, Memory, Disk Usage (Node Exporter).
- **Core Services**: Low-latency metric cards for Odoo, WordPress, and Portainer.
- **Container Infrastructure**:
  - **Active Containers**: Scrollable list with privacy-masking for sensitive services.
  - **Docker Stats**: CPU/RAM usage across all containers.

### 2. UI/UX Enhancements

- **Dual Theme Support**:
  - **Dark Mode**: Deep black backgrounds (`#050505`), neon accents, and animated grid effects.
  - **Light Mode**: High-contrast white/gray palette for professional environments.
  - **Toggle**: Integrated Sun/Moon switch in the header.
- **Visual Polish**:
  - **Glassmorphism**: Cards use `backdrop-blur-xl` and refined transparency.
  - **Interactivity**: Unified glow effects (`shadow-glow`) on hover for all cards.
  - **Typography**: Complete overhaul to use `Orbitron` and `JetBrains Mono`.
- **Layout Standardization**:
  - **Full-Width Sections**: Moved from nested grids to distinct horizontal sections (System, VPS, Services, Traefik, Containers) for better readability and scalability.
  - **Centered Elements**: Optimized alignment for "Container Infrastructure" cards and Footer text to ensure perfect visual balance on all screen sizes.

### 3. Architecture Components

- **`lib/prometheus/client.ts`**:
  - Robust PromQL querying with `fetch`.
  - **Instant Queries**: New `query` method for current state data.
  - **Auto-Auth**: Supports Basic Auth if `PROMETHEUS_USERNAME` is set.
- **`lib/github/client.ts`**:
  - GraphQL client to fetch comprehensive user contribution data.
- **`components/ui/metrics-card.tsx`**:
  - Reusable, responsive chart component with dynamic sizing.
- **`components/ui/container-list.tsx`**:
  - Fixed-height list (`300px`) matching chart cards for layout symmetry.
- **`components/ui/time-range-filter.tsx`**:
  - **[NEW]** Interactive time range selector (1H, 6H, 24H).
  - Updates URL parameters (`?range=6h`) for bookmarkable reports.

### 4. Deployment Ready

- **Docker**: Optimized `Dockerfile` using Next.js standalone output mode.
- **Kubernetes**: Fully defined manifests in `homelab-infra/k8s/02-apps/portfolio`.
  - **Ingress**: Exposed via Traefik IngressRoute at `status-taloslab.subetupaginacp.com`.
  - **Internal DNS**: Connects to `kube-stack-kube-prometheus-prometheus.monitoring:9090`.
- **Local Dev**: `docker-compose.yml` with log rotation configured (10m size limit).

## 🔧 How to Continue Development

### Prerequisites

- Node.js 18+
- Access to Prometheus (Tunnel or Public URL)
- GitHub Personal Access Token (`read:user`)

### Environment Setup (`.env.local`)

To fetch **REAL data** during local development, create `.env.local`:

```env
# Option A: Public URL (Recommended)
PROMETHEUS_URL=https://prometheus.subetupaginacp.com
PROMETHEUS_USERNAME=admin
PROMETHEUS_PASSWORD=your_password

# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
```

### Roadmap / Next Steps

1. **Odoo Specific Metrics**: Add a section for specific Odoo business metrics (e.g., Orders/hr) using `postgres-exporter` queries.
2. **CI/CD**: Setup GitHub Actions to build and push the Docker image to the VPS.

## 🔍 Troubleshooting

- **Theme Flashing**: Resolved via `suppressHydrationWarning` in `layout.tsx`.
- **Recharts Warnings**: You might see `width(-1)` warnings in console. These are benign client-side checks during initial render.
- **Prometheus Queries**: Metric names can vary by Traefik version (e.g., `traefik_open_connections` vs `traefik_entrypoint_open_connections`).
