import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function generateCaseNumber(counter: number): string {
  const year = new Date().getFullYear();
  return `CL-${year}-${String(counter).padStart(4, "0")}`;
}

export function getDaysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-status-active";
    case "discharged":
      return "text-status-discharged";
    case "follow-up":
      return "text-status-warning";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-50 dark:bg-green-950";
    case "discharged":
      return "bg-purple-50 dark:bg-purple-950";
    case "follow-up":
      return "bg-amber-50 dark:bg-amber-950";
    default:
      return "bg-muted";
  }
}

export function getEntryTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    observation: "🩺",
    treatment: "💉",
    medication: "💊",
    procedure: "🏥",
    "lab-result": "🔬",
    imaging: "🖼️",
    note: "📋",
    complication: "⚠️",
  };
  return icons[type] ?? "📋";
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-status-critical";
    case "important":
      return "text-status-warning";
    default:
      return "text-muted-foreground";
  }
}

export function fileSizeToString(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
