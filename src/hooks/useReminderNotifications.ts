import { useEffect, useState, useCallback } from "react";
import type { Reminder } from "@/lib/types";

const NOTIFIED_KEY = "caselog_notified_reminders";

function getNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markNotified(id: string) {
  const set = getNotified();
  set.add(id);
  // Keep only last 200 entries to prevent unbounded growth
  const arr = [...set].slice(-200);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
}

function currentPermission(): NotificationPermission {
  return typeof Notification !== "undefined"
    ? Notification.permission
    : "denied";
}

async function showNotification(title: string, options: NotificationOptions) {
  // Mobile browsers (PWA) require ServiceWorker showNotification
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, options);
    return;
  }
  // Desktop fallback
  new Notification(title, options);
}

export function useReminderNotifications(reminders: Reminder[]) {
  const [permission, setPermission] =
    useState<NotificationPermission>(currentPermission);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  // Check reminders every 60 seconds and on changes
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (permission !== "granted") return;

    const checkAndNotify = () => {
      const now = Date.now();
      const notified = getNotified();

      for (const r of reminders) {
        if (r.status === "dismissed" || r.status === "sent") continue;
        if (notified.has(r.id)) continue;

        const due = r.dueDate?.toDate?.();
        if (!due) continue;

        // Notify if due within the next 15 minutes or already past
        const diff = due.getTime() - now;
        if (diff <= 15 * 60 * 1000) {
          showNotification(`Reminder: ${r.title}`, {
            body: `Patient: ${r.patientName}${r.note ? `\n${r.note}` : ""}`,
            icon: "/icons/icon-192x192.png",
            tag: r.id,
          });
          markNotified(r.id);
        }
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60_000);
    return () => clearInterval(interval);
  }, [reminders, permission]);

  return { requestPermission, permission };
}
