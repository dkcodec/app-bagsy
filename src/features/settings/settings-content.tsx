"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher, ThemeToggle } from "@/src/widgets";
import { BellRing, BellOff } from "lucide-react";
import { PushNotificationManager } from "@/src/shared/utils/push-notifications";
import { Button } from "@/src/entities";

const SettingsContent: React.FC = () => {
  const t = useTranslations("Settings");

  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    setIsSupported("Notification" in window && "serviceWorker" in navigator);
    setPermission(Notification.permission);

    checkSubscription();
  }, []);

  async function checkSubscription() {
    if (!isSupported) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  }

  async function handleToggle() {
    console.log("--------------------------------");
    console.log("handleToggle");
    console.log("isSubscribed", isSubscribed);
    console.log("permission", permission);
    console.log("isSupported", isSupported);
    console.log("--------------------------------");
    const manager = new PushNotificationManager(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    );

    if (isSubscribed) {
      await manager.unsubscribe();
      setIsSubscribed(false);
    } else {
      try {
        await manager.subscribe();
        setIsSubscribed(true);
        setPermission("granted");
      } catch (error) {
        console.error("Subscription failed:", error);
      }
    }
  }

  console.log("isSubscribed", isSubscribed);
  console.log("permission", permission);
  console.log("isSupported", isSupported);

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-(--muted-background) border border-border p-3 md:p-4 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("theme")}</h2>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("language")}</h2>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{t("notifications")}</h2>
            {!isSupported && <p>Ваш браузер не поддерживает уведомления</p>}

            {isSupported && permission === "denied" && (
              <p>
                Вы заблокировали уведомления. Разрешите их в настройках браузера
              </p>
            )}

            {isSupported && permission !== "denied" && (
              <Button onClick={handleToggle} variant="outline" size="icon">
                {isSubscribed ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <BellRing className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { SettingsContent };
