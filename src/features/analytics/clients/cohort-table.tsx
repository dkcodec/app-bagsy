"use client";
import { useTranslations } from "next-intl";
import type { IClientsAnalyticsDto } from "@/src/shared/types/analytics";
import { formatPercent } from "@/src/shared/utils";

/**
 * Когорты новых клиентов по месяцам.
 * Простая таблица с прогресс-барами активности.
 */
export function CohortTable({
  cohorts,
}: {
  cohorts: IClientsAnalyticsDto["cohorts"];
}) {
  const t = useTranslations("Analytics.clients");
  return (
    <div className="space-y-3">
      {cohorts.map((c, i) => (
        <div key={c.month}>
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium">{c.month}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatPercent(c.active_percent * 100)} {t("active")} (
              {c.new_count} {t("newCount")})
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-300 to-accent-500 motion-safe:transition-[width] motion-safe:duration-700"
              style={{
                width: `${c.active_percent * 100}%`,
                transitionDelay: `${i * 80}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
