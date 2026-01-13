# 05. Pipeline CI/CD

## 6. GitOps Pipeline

Fully automated deployment pipeline via GitHub Actions.

### Steps

1. **Trigger**: Push to `main` branch.
2. **Build**: Multi-stage Docker build (Node 22 Alpine + Next.js Standalone).
3. **Push**: Image pushed to GHCR (`latest` + `sha-xxxxxxx`).
4. **GitOps Update**:
    - Updates `k8s/02-apps/portfolio/observability-deployment.yaml` in `talos-gitops` repo.
    - Commits and pushes changes.
5. **ArgoCD Sync**: Detects manifest change and performs Rolling Update.

### Secrets Required

| Secret | Description |
| :--- | :--- |
| `GITOPS_PAT` | Personal Access Token with `repo` scope for `talos-gitops`. |
