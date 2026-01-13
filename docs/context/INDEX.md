# Contexto Modular: Portfolio Observability

Esta carpeta contiene la documentación modular del proyecto `portfolio-observability`. Utiliza estos archivos para alimentar al agente IA con contexto específico según la tarea.

## Índice de Módulos

| Archivo | Contenido |
| :--- | :--- |
| [01_OVERVIEW_STACK.md](./01_OVERVIEW_STACK.md) | Visión general, propósito y stack tecnológico (Next.js 16, Prometheus). |
| [02_ARCHITECTURE.md](./02_ARCHITECTURE.md) | Arquitectura de sistema, flujo de datos y seguridad. |
| [03_FEATURES.md](./03_FEATURES.md) | Dashboard unificado, temas UI/UX y enmascaramiento de datos. |
| [04_INFRA_DEPLOYMENT.md](./04_INFRA_DEPLOYMENT.md) | Estado de despliegue en K8s y Docker. |
| [05_CI_CD.md](./05_CI_CD.md) | Pipeline GitOps y actualizaciones automáticas. |
| [06_DEVELOPMENT.md](./06_DEVELOPMENT.md) | Setup de entorno local, variables env y comandos. |

## Cómo usar este contexto

- **Para tareas generales**: Lee la raíz `INDEX.md` (este archivo).
- **Para frontend/UI**: Consulta `03_FEATURES.md`.
- **Para backend/API**: Consulta `02_ARCHITECTURE.md`.
- **Para despliegues/DevOps**: Consulta `04_INFRA_DEPLOYMENT.md` y `05_CI_CD.md`.
