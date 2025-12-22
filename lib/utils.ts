import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to mask sensitive container names
export function maskContainerName(name: string): string {
  // Allow-list of public/safe services to show real names (or pretty versions)
  const safeMap: Record<string, string> = {
    "odoo": "Odoo ERP Core",
    "wordpress": "WordPress Store",
    "traefik": "Traefik Proxy",
    "portainer": "Portainer Mgmt",
    "grafana": "Grafana Dashboards",
    "prometheus": "Prometheus DB",
    "cadvisor": "Container Advisor",
    "node-exporter": "Node Metrics",
    "loki": "Loki Logs",
    "postgres": "PostgreSQL DB",
    "redis": "Redis Cache",
    "minio": "Object Storage",
    "seaweedfs": "SeaweedFS"
  };

  const lowerName = name.toLowerCase();

  for (const [key, label] of Object.entries(safeMap)) {
    if (lowerName.includes(key)) {
      return label; // Return pretty name if matched
    }
  }

  // Obfuscate the rest with a deterministic Cyberpunk-style ID based on the name length
  // We don't use the name itself to generate the hash to avoid any reverse engineering
  const id = Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 31).toString(16).substring(0, 4).toUpperCase();
  return `SECURE-MODULE-0x${id}`;
}
