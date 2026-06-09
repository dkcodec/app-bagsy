"use client";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/src/entities";
import { useCountUp } from "@/src/shared/hooks/use-count-up";
import { formatPercent } from "@/src/shared/utils";
import { cn } from "@/src/shared/utils/styles";

interface KpiCardProps {
  /** Лейбл метрики (переведённый) */
  label: string;
  /** Финальное значение (число) */
  value: number;
  /** Δ% vs предыдущий период; null = нет данных для сравнения */
  deltaPercent: number | null;
  /** Кастомное форматирование числа (formatTenge / formatPercent / ...) */
  format?: (n: number) => string;
  /** Инверсия "плохо/хорошо": для метрик где меньше = лучше (отмены) */
  invertDelta?: boolean;
}

/**
 * Универсальная карточка KPI.
 * - Анимирует число count-up при первом появлении и смене значения.
 * - Цвет дельты автоматически: позитив = success, негатив = destructive.
 * - invertDelta: для метрик где падение — это хорошо (отмены, no-show).
 *
 * Контекст «vs предыдущий период» подразумевается выбранным в шапке периодом —
 * подпись намеренно не дублируется, чтобы карточки оставались компактными
 * (паттерн как у YCLIENTS / Stripe).
 */
export function KpiCard({
  label,
  value,
  deltaPercent,
  format = n => Math.round(n).toLocaleString("ru-RU"),
  invertDelta,
}: KpiCardProps) {
  const animated = useCountUp(value);

  // Определяем "хороший" ли тренд для подсветки
  let trend: "up" | "down" | "flat" = "flat";
  if (deltaPercent !== null) {
    if (deltaPercent > 0.5) trend = "up";
    else if (deltaPercent < -0.5) trend = "down";
  }
  const isGood =
    trend === "flat" ? null : invertDelta ? trend === "down" : trend === "up";

  const trendIcon =
    trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <Card className="card-hover">
      <CardContent className="p-4 md:p-5">
        <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
        <div className="text-2xl font-bold tabular-nums tracking-tight">
          {format(animated)}
        </div>
        {deltaPercent !== null && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              isGood === null
                ? "text-muted-foreground"
                : isGood
                  ? "text-success"
                  : "text-destructive"
            )}
          >
            <TrendIcon className="size-3" />
            <span className="tabular-nums">
              {formatPercent(deltaPercent, 1, true)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
