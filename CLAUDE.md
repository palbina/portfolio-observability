# CLAUDE.md

> **Crucial context for AI Agents working on this project.**
> *Read this file to understand the project structure and recent changes.*

## Project Overview

Portfolio Observability - A high-performance, cyberpunk-themed telemetry dashboard built with Next.js 16, visualizing Prometheus metrics and GitHub activity.

## Commands

- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`

## Architecture

- **Framework**: Next.js 16 (App Router, Server Components)
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Data Sources**: Prometheus (Server-Side Fetching), GitHub GraphQL API
- **Containerization**: Docker (Standalone Output)
- **Orchestration**: Kubernetes (K3s) with ArgoCD
- [Detailed Architecture](docs/context/02_ARCHITECTURE.md)
- [Infrastructure & Deployment](docs/context/04_INFRA_DEPLOYMENT.md)
- [CI/CD Pipeline](docs/context/05_CI_CD.md)

## Features

- **Unified Dashboard**: Real-time metrics for CPU, Memory, Disk, Network. [Details](docs/context/03_FEATURES.md)
- **Container Monitoring**: Docker stats via cAdvisor.
- **Service Traffic**: Traefik integration for RPS and error rates.
- **GitHub Stats**: Contribution graph integration.
- **Data Masking**: Privacy for sensitive container names.
- [Feature Details](docs/context/03_FEATURES.md)

## Refactors

- **Dashboard Data Fetching** (2026-02-08) - [Details](docs/context/refactors/dashboard-data-fetching.md)
  Centralized data fetching logic for the dashboard and API into a shared service, implemented server-side metric aggregation, and improved application reliability with timeouts and health checks.

## Bugs

- **Fixed**: GitHub API hanging requests (fixed with timeout).
- **Fixed**: Recharts rendering errors (fixed with min constraints).
- **Fixed**: Docker build failure due to python venv (fixed with .gitignore).

## Performance

- **Image Optimization**: Added `sharp` for standalone builds.
- **Font Loading**: Used `display: swap` for better LCP.
- **Server Aggregation**: Moved heavy metric calculations to server-side.

## Security

- **Health Check**: Added `/api/health` for liveness probes.
- **Validation**: Strict validation on data fetching.
- [Security Context](docs/context/02_ARCHITECTURE.md#security)

## Development

- [Setup Guide](docs/context/06_DEVELOPMENT.md)
