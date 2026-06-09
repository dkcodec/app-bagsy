export class PushNotificationManager {
  private vapidPublicKey: string;

  constructor(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey;
  }

  // Запрос разрешения и подписка
  async subscribe() {
    // 1. Проверяем поддержку
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Workers not supported");
    }

    if (!("PushManager" in window)) {
      throw new Error("Push API not supported");
    }

    // 2. Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permission denied");
    }

    // 3. Получаем SW registration
    const registration = await navigator.serviceWorker.ready;

    // 4. Подписываемся на push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
    });
    console.log("subscription", subscription);
    // 5. Отправляем подписку на бэк

    try {
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceType: this.getDeviceType(),
        }),
      });
    } catch (error) {
      console.error("Subscription failed:", error);
    }

    return subscription;
  }

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      // Удаляем с бэка
      try {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      } catch (error) {
        console.error("Unsubscription failed:", error);
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string) {
    // Конвертация VAPID ключа
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }
}
