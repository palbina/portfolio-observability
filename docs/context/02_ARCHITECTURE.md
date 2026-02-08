# 02. Arquitectura del Sistema

## 3. Architecture Overview

This service acts as a secure proxy and visualization layer between the public internet and the private infrastructure control plane.

### Data Flow

1. **Browser**: User requests dashboard or metrics via HTTP/S.
2. **Next.js Service (SSR/API)**:
    * **Dashboard UI**: Renders charts using Recharts and Client Components.
    * **API Routes**: Server-Side Proxy (`/api/metrics`) handles authenticated queries to backend.
3. **Infrastructure (Private)**:
    * **Prometheus**: Time-series DB collecting metrics from Node Exporter, cAdvisor, and Traefik.
4. **External Services**:
    * **GitHub API**: Fetches user contribution data via GraphQL.

### Component Structure

* **`lib/prometheus/client.ts`**: Robust PromQL querying with `fetch`. Support for instant queries and Basic Auth.
* **`lib/github/client.ts`**: GraphQL client for user contribution data.
* **`components/ui/metrics-card.tsx`**: Reusable, responsive chart component.
* **`components/ui/container-list.tsx`**: Fixed-height list for container status.
* **`app/page.tsx`**: Unified dashboard with responsive grid layout.

## 4. Knowledge Base (RAG)

Integrated Retrieval-Augmented Generation for code navigation:

* **Vector DB**: Qdrant (Self-hosted).
* **Search Engine**: Nomic Embed Text v1.5 (Semantic).
* **Usage**: `scripts/ask_local_context.py` for instant documentation lookup.

### Security Architecture

* **Server-Side Fetching**: API keys (GitHub, Prometheus) never exposed to client.
* **CORS Configuration**: Strict headers to allow requests only from main portfolio.
* **Data Sanitization**: Internal infrastructure details (sensitive container names) masked before sending to frontend.
