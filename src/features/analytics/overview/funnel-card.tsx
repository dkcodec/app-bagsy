"use client";
import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";
import { formatPercent } from "@/src/shared/utils";
import type { IFunnelStage } from "@/src/shared/types/analytics";
import { CHART_COLORS } from "../constants";

/**
 * Воронка: Создано → Подтверждено → Состоялось.
 * Бары растут от 0 с stagger по этапам — приятный flow при появлении.
 */
export function FunnelCard({ stages }: { stages: IFunnelStage[] }) {
  const t = useTranslations("Analytics");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = stages[0]?.count ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="size-4 text-accent" />
          {t("charts.funnel")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((s, i) => {
            const width = max > 0 ? (s.count / max) * 100 : 0;
            return (
              <div key={s.key} style={{ ["--i" as string]: i }}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm font-medium">
                    {t(`funnel.${s.key}`)}
                  </span>
                  <span className="text-sm tabular-nums">
                    {s.count.toLocaleString("ru-RU")}
                    {i > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatPercent(s.conversion * 100)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
                    style={{
                      width: ready ? `${width}%` : "0%",
                      background: CHART_COLORS.serie[i],
                      transitionDelay: `${i * 120}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
