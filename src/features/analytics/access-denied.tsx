"use client";
import { ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Экран "нет прав". Используется гардами подстраниц.
 */
export function AccessDenied() {
  const t = useTranslations("Analytics");
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <ShieldOff className="size-12 text-muted-foreground mb-3" />
      <h2 className="text-lg font-semibold mb-1">{t("accessDenied")}</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {t("accessDeniedDescription")}
      </p>
    </div>
  );
}
