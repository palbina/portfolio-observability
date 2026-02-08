# 06. Desarrollo Local

## 7. Development Workflow

### Prerequisites

- Node.js 18+ (20+ recommended)
- Access to Prometheus (Tunnel, Public URL, or Local instance)
- GitHub Personal Access Token (`read:user`)

### Environment Setup (`.env.local`)

To fetch **REAL data** during local development:

```env
# Option A: Public URL (Recommended)
PROMETHEUS_URL=https://prometheus.example.com
PROMETHEUS_USERNAME=admin
PROMETHEUS_PASSWORD=your_password

# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
```

### Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# -----------------
# RAG Context Tools
# -----------------

# Intelligent Search
python ../scripts/ask_local_context.py "how does the prometheus proxy work?"
```

### Troubleshooting

- **Recharts Warnings**: `width(-1)` warnings are benign client-side checks.
- **Prometheus Queries**: Metric names may vary by Traefik version.
