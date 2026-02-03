"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/src/entities/button";
import { useSidebar } from "@/src/entities/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/entities/tooltip";
import { useTranslations } from "next-intl";

// Тип для beforeinstallprompt события
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt для всех устройств.
 * Использует beforeinstallprompt для Android/Desktop и инструкции для iOS.
 * Адаптируется под состояние сайдбара (expanded/collapsed).
 */
export function PwaInstallPrompt() {
  const t = useTranslations("PwaInstallPrompt");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Проверяем, не установлено ли уже приложение
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) return;

    // Обработка beforeinstallprompt для Android/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Проверка iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: boolean }).MSStream;

    if (isIOS) {
      setShowIOSPrompt(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Обработка установки через beforeinstallprompt
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Показываем диалог установки
    deferredPrompt.prompt();

    // Ждем результата
    const { outcome } = await deferredPrompt.userChoice;

    // Очищаем промпт после использования (браузер может показать его снова позже)
    setDeferredPrompt(null);
  };

  // Если нет промпта для установки и не iOS - не показываем ничего
  if (!deferredPrompt && !showIOSPrompt) return null;

  // Для iOS показываем инструкции
  if (showIOSPrompt && !deferredPrompt) {
    return (
      <div className="border-t px-2 py-2 text-center text-xs text-muted-foreground">
        {t("add-to-home-screen")}: {t("share")}
        <span aria-hidden> ⎋ </span>→ {t("to-home-screen")}
      </div>
    );
  }

  // Для Android/Desktop показываем кнопку установки
  if (deferredPrompt) {
    const buttonContent = (
      <Button
        variant="outline"
        size={isCollapsed ? "icon" : "sm"}
        onClick={handleInstallClick}
        className="w-full"
        aria-label={t("install-app")}
      >
        <Download size={4} />
        {!isCollapsed && <span>{t("install")}</span>}
      </Button>
    );

    // Если сайдбар свернут, показываем кнопку с tooltip
    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="border-t pt-2">{buttonContent}</div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t("install-app")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Если сайдбар развернут, показываем кнопку с текстом
    return <div className="border-t px-2 py-2">{buttonContent}</div>;
  }

  return null;
}
