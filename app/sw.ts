/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Манифест precache подставляется при сборке
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // Офлайн: для document показываем страницу /offline
  fallbacks: {
    entries: [
      {
        url: "/:locale/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// 🔔 Обработка Push-событий
self.addEventListener("push", (event: PushEvent) => {
  console.log("push", event);
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log("pushData", pushData);
      const notificationOptions: NotificationOptions & {
        actions?: Array<{ action: string; title: string; icon?: string }>;
        image?: string;
        vibrate?: number[];
        timestamp?: number;
      } = {
        body: pushData.body || "Новое сообщение",
        icon: pushData.icon || "/icon-192x192.png",
        badge: pushData.badge || "/badge-72x72.png",
        image: pushData.image,
        tag: pushData.tag || "default",
        data: pushData.data,
        requireInteraction: pushData.requireInteraction || false,
        silent: pushData.silent || false,
        vibrate: pushData.vibrate || [200, 100, 200],
        timestamp: Date.now(),
        actions: pushData.actions || [],
      };
      console.log("notificationOptions", notificationOptions);
      event.waitUntil(
        self.registration
          .showNotification(pushData.title, notificationOptions)
          .then(notification => {
            console.log("notification", notification);
          })
      );
    } catch (error) {
      console.error("Push notification error:", error);
    }
  }
});

// 🖱️ Обработка кликов по уведомлениям
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        // Если есть открытое окно - фокусируемся на нем
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // Иначе открываем новое
        return self.clients.openWindow(urlToOpen);
      })
  );
});

serwist.addEventListeners();
