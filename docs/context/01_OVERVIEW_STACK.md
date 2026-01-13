# 01. Visión General y Stack Tecnológico

## 1. Project Overview

**Project Name**: `portfolio-observability`
**Type**: Telemetry Dashboard Microservice (Next.js)
**Theme**: Premium Cyberpunk/Neon (Dark Mode) vs Clean Corporate (Light Mode)
**Purpose**: Serves as the central "Brain" of the DevOps Portfolio ecosystem, aggregating, processing, and visualizing real-time infrastructure metrics from Prometheus and GitHub.
**Key Differentiator**: Real-time integration with live infrastructure, secure proxy architecture, and "Living Portfolio" concept.

## 2. Technology Stack (Latest - Jan 2026)

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** | `16` | App Router, Server Components & Server Actions (Turbopack) |
| **Core** | **React** | `19` | Latest UI library |
| **Language** | **TypeScript** | `5+` | Strict typing for robust API handling |
| **Styling** | **Tailwind CSS** | `v4` | Utility-first CSS with native variables + `tailwindcss-animate` |
| **Fonts** | **Orbitron & JetBrains Mono** | - | Cyberpunk aesthetic headings and data/code display |
| **Visualization** | **Recharts** | - | Composable, responsive charting library |
| **Data Source** | **Prometheus** | - | Real-time infrastructure metrics |
| **External API** | **GitHub GraphQL** | - | Development activity & contribution stats |
| **Container** | **Docker** | Multi-stage | Optimized Next.js standalone build |
