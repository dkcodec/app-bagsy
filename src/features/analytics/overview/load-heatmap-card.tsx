"use client";
import { useMemo } from "react";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/entities";
import type { IHeatmapCell } from "@/src/shared/types/analytics";
import { cn } from "@/src/shared/utils/styles";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * Heatmap нагрузки 7×N часов.
 * Интенсивность цвета по value (0..1) через brand accent с прозрачностью.
 */
export function LoadHeatmapCard({ cells }: { cells: IHeatmapCell[] }) {
  const t = useTranslations("Analytics");
  const tDays = useTranslations("Dashboard.Settings"); // переиспользуем mon/tue/.../sun

  // Группируем ячейки в матрицу [weekday][hour]
  const { hours, byKey } = useMemo(() => {
    const hSet = new Set<number>();
    const map = new Map<string, number>();
    cells.forEach(c => {
      hSet.add(c.hour);
      map.set(`${c.weekday}-${c.hour}`, c.value);
    });
    return {
      hours: [...hSet].sort((a, b) => a - b),
      byKey: map,
    };
  }, [cells]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-4 text-accent" />
          {t("charts.heatmap")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `auto repeat(${hours.length}, minmax(0, 1fr))`,
            }}
          >
            {/* Шапка часов */}
            <div />
            {hours.map(h => (
              <div
                key={h}
                className="text-[10px] text-muted-foreground text-center"
              >
                {h}
              </div>
            ))}

            {/* Строки по дням недели */}
            {WEEKDAY_KEYS.map((dayKey, w) => (
              <FragmentRow
                key={dayKey}
                weekday={w}
                dayLabel={tDays(dayKey)}
                hours={hours}
                byKey={byKey}
              />
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

function FragmentRow({
  weekday,
  dayLabel,
  hours,
  byKey,
}: {
  weekday: number;
  dayLabel: string;
  hours: number[];
  byKey: Map<string, number>;
}) {
  return (
    <>
      <div className="text-xs text-muted-foreground pr-2 self-center">
        {dayLabel}
      </div>
      {hours.map((h, i) => {
        const value = byKey.get(`${weekday}-${h}`) ?? 0;
        // Интенсивность от accent с прозрачностью 0..1
        const opacity = 0.08 + value * 0.85;
        return (
          <Tooltip key={h}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "aspect-square rounded-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50"
                )}
                style={{
                  backgroundColor: `hsl(var(--accent) / ${opacity})`,
                  animationDelay: `${(weekday * hours.length + i) * 4}ms`,
                  animationDuration: "400ms",
                  animationFillMode: "both",
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {dayLabel} {h}:00 — {Math.round(value * 100)}%
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
