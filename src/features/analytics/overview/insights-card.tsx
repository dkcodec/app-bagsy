"use client";
import { useTranslations } from "next-intl";
import type { IInsight } from "@/src/shared/types/analytics";
import { InsightBanner } from "../components/insight-banner";

/**
 * Блок авто-инсайтов.
 * Ключи в `Analytics.insights.<key>` поддерживают ICU-подстановки {name}/{percent}.
 */
export function InsightsCard({ insights }: { insights: IInsight[] }) {
  const t = useTranslations("Analytics.insights");
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => (
        <InsightBanner key={`${ins.key}-${i}`} level={ins.level}>
          {/* next-intl поддерживает variables только если ключ существует —
              иначе показываем сам ключ как fallback */}
          {t(ins.key, (ins.params ?? {}) as Record<string, string | number>)}
        </InsightBanner>
      ))}
    </div>
  );
}
