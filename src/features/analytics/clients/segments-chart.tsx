"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";
import { formatPercent } from "@/src/shared/utils";
import type { IClientsAnalyticsDto } from "@/src/shared/types/analytics";
import { CHART_COLORS } from "../constants";

/**
 * Распределение клиентов по сегментам (горизонтальные бары).
 */
export function SegmentsChart({
  segments,
}: {
  segments: IClientsAnalyticsDto["segments"];
}) {
  const t = useTranslations("Analytics");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.segments")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {segments.map((s, i) => (
            <li key={s.key}>
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="font-medium">{t(`segments.${s.key}`)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatPercent(s.share * 100)} ({s.count})
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700"
                  style={{
                    width: ready ? `${s.share * 100}%` : "0%",
                    background:
                      CHART_COLORS.serie[i % CHART_COLORS.serie.length],
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
