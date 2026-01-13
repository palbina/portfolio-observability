# 04. Infraestructura y Despliegue

## 5. Deployment Status

**Current Version**: 0.2.0
**Environment**: Production (Kubernetes) / Local (Docker Compose)

### Kubernetes Implementation

- **Manifests**: Defined in `homelab-infra/k8s/02-apps/portfolio`.
- **Ingress**: Exposed via Traefik IngressRoute at `status-taloslab.example.com`.
- **Internal DNS**: Connects directly to `kube-stack-kube-prometheus-prometheus.monitoring:9090`.

### Docker Configuration

- **Build**: Optimized `Dockerfile` using Next.js standalone output mode (Node 22 Alpine).
- **Local Dev**: `docker-compose.yml` configured with log rotation (10m size limit).
