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
 * Фиксированная сетка рабочих часов 9..21 (13 ячеек). Бэк отдаёт только часы
 * с активностью — отсутствующие ячейки дорисовываются как пустые (value=0),
 * чтобы у пользователя всегда был полный обзор дня и стабильный layout.
 */
const WORKING_HOURS = Array.from({ length: 13 }, (_, i) => 9 + i);

/**
 * Heatmap нагрузки 7 дней × 13 часов (9..21).
 * Интенсивность цвета по value (0..1) через brand accent с прозрачностью.
 */
export function LoadHeatmapCard({ cells }: { cells: IHeatmapCell[] }) {
  const t = useTranslations("Analytics");
  const tDays = useTranslations("Dashboard.Settings"); // переиспользуем mon/tue/.../sun

  // Карта (weekday-hour → value). Отсутствующие ключи возвращают 0 при доступе.
  const byKey = useMemo(() => {
    const map = new Map<string, number>();
    cells.forEach(c => map.set(`${c.weekday}-${c.hour}`, c.value));
    return map;
  }, [cells]);

  const hours = WORKING_HOURS;

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
              // Фикс 13 часов: колонки равномерно делят ширину карточки,
              // никаких разрастаний от 2-3 пришедших часов.
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
              {/* Фиксированная высота h-6 — без aspect-square, чтобы при узких
                  колонках на мобиле ячейки не схлопывались по высоте. */}
              <div
                className={cn(
                  "h-6 w-full rounded-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50"
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
