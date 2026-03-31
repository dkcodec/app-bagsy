"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Switch } from "@/src/entities/switch";
import { Skeleton } from "@/src/entities";
import { PushNotificationManager } from "@/src/shared/utils/push-notifications";
import { cn } from "@/src/shared/utils/styles";

/**
 * Таб «Внешний вид» — тема, язык, уведомления
 */
export function AppearanceTab() {
  const t = useTranslations("Account.Appearance");
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydration guard для темы
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Push-уведомления
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready.then(async reg => {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const handlePushToggle = async () => {
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
  };

  /* Сохраняем search params (включая ?tab=) при смене языка */
  const handleLocaleChange = (newLocale: string) => {
    const qs = searchParams.toString();
    /* pathname из next/navigation = "/ru/account", заменяем локаль */
    const pathWithoutLocale = pathname.replace(`/${locale}`, "");
    const url = `/${newLocale}${pathWithoutLocale}${qs ? `?${qs}` : ""}`;
    router.replace(url);
  };

  // Пока не mounted — показываем скелетон для тем
  const themes = [
    { value: "light", label: t("light"), bg: "bg-white border-border" },
    { value: "dark", label: t("dark"), bg: "bg-[#1a1a1a]" },
    {
      value: "system",
      label: t("system"),
      bg: "bg-gradient-to-r from-white from-50% to-[#1a1a1a] to-50%",
    },
  ] as const;

  const languages = [
    { code: "ru", label: t("russian") },
    { code: "kz", label: t("kazakh") },
  ];

  return (
    <div className="space-y-6">
      {/* Тема */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("theme")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {!mounted
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border p-3 text-center"
                >
                  <Skeleton className="w-full h-12 rounded-md mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))
            : themes.map(t_item => (
                <button
                  key={t_item.value}
                  onClick={() => setTheme(t_item.value)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-center cursor-pointer transition-colors",
                    theme === t_item.value
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className={cn(
                      "w-full h-12 rounded-md mb-2 border",
                      t_item.bg
                    )}
                  />
                  <p
                    className={cn(
                      "text-sm",
                      theme === t_item.value && "font-medium"
                    )}
                  >
                    {t_item.label}
                  </p>
                </button>
              ))}
        </div>
      </section>

      {/* Язык */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("language")}
        </p>
        <div className="rounded-lg border border-border divide-y divide-border">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={cn(
                "w-full px-4 py-3.5 flex items-center gap-2.5 text-left cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg",
                locale === lang.code && "bg-muted/50"
              )}
              onClick={() => handleLocaleChange(lang.code)}
            >
              {/* Radio dot */}
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  locale === lang.code
                    ? "bg-foreground"
                    : "border-[1.5px] border-muted-foreground/40"
                )}
              />
              <p
                className={cn("text-sm", locale === lang.code && "font-medium")}
              >
                {lang.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Уведомления */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("notifications")}
        </p>

        {/* Ошибки поддержки */}
        {!isSupported && (
          <p className="text-sm text-muted-foreground mb-3">
            {t("notSupported")}
          </p>
        )}
        {isSupported && permission === "denied" && (
          <p className="text-sm text-muted-foreground mb-3">{t("blocked")}</p>
        )}

        <div className="rounded-lg border border-border divide-y divide-border">
          {/* Push-уведомления */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm">{t("pushNotifications")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("pushDescription")}
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || permission === "denied"}
            />
          </div>

          {/* SMS напоминания — presentational */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm">{t("smsReminders")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("smsRemindersDescription")}
              </p>
            </div>
            <Switch checked disabled />
          </div>

          {/* Email digest — presentational */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm">{t("dailyDigest")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("dailyDigestDescription")}
              </p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </section>
    </div>
  );
}
