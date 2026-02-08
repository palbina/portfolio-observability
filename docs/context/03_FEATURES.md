# 03. Características y Funcionalidades

## 4. Key Features

### A. Unified Dashboard (`app/page.tsx`)

- **System Status**:
  - Real-time "Status Dot" toggled by Prometheus `up` metric.
  - Public API endpoint (`/api/observability/metrics`) for external consumers.
- **GitHub Activity**: Real-time coding stats (contributions, streaks).
- **VPS Resources**: CPU, Memory, Disk Usage visualizations.
- **Core Services**: Low-latency cards for Odoo, WordPress, Portainer.
- **Container Infrastructure**: Scrollable list of active containers with privacy masking.

### B. UI/UX Enhancements

- **Dual Theme Support**:
  - **Dark Mode**: Cyberpunk, Neon (`#050505` bg), animated grid.
  - **Light Mode**: Clean corporate, high-contrast.
  - **Toggle**: Integrated Sun/Moon switch.
- **Visual Polish**:
  - **Glassmorphism**: `backdrop-blur-xl` cards.
  - **Interactivity**: `shadow-glow` effects, interactive time-range selector (1H, 6H, 24H).
  - **Typography**: Orbitron (Headings) + JetBrains Mono (Data).

### C. Smart Masking

- **Privacy-First**: Sensitive container names are obfuscated with deterministic hashes (`SECURE-MODULE-0x...`).
- **Public Safe-List**: Known public services (e.g., Odoo) remain recognizable.

### D. Context-Aware Intelligence (RAG)

- **Semantic Search**: Integrated Qdrant-based documentation search.
- **Smart Hooks**: Git pre-commit hooks that suggest relevant documentation based on staged changes.
