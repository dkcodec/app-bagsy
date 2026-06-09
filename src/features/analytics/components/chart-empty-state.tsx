"use client";
import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Пустое состояние для графика/секции — когда нет данных за период.
 */
export function ChartEmptyState({ className }: { className?: string }) {
  const t = useTranslations("Analytics");
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-muted-foreground ${className ?? ""}`}
    >
      <Inbox className="size-8 mb-2 opacity-50" />
      <p className="text-sm">{t("empty")}</p>
    </div>
  );
}
