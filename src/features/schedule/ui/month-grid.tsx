"use client";

import { useCallback, useMemo } from "react";
import { getDay, startOfDay } from "date-fns";
import { cn } from "@/src/shared/utils/styles";
import { useTranslations } from "next-intl";
import type { MonthSchedule } from "@/src/shared/types/schedule";

export interface MonthGridProps {
  /** Текущий месяц (для подсветки «сегодня»). */
  currentMonth: Date;
  /** Количество дней в месяце (1..31). */
  daysInMonth: number;
  /** Выбранные дни (номера 1..31). */
  selectedDays: number[];
  /** Полное расписание месяца (для отображения часов в ячейке). */
  monthSchedule: MonthSchedule;
  onToggleDay: (day: number) => void;
  onRangeSelect?: (from: number, to: number) => void;
  readOnly?: boolean;
  /** Мобильный режим — компактные ячейки, однобуквенные дни. */
  isMobile?: boolean;
}

/** Дни недели начиная с понедельника (ISO). */
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Получить смещение первого дня месяца (0=Пн, 6=Вс). */
function getFirstDayOffset(year: number, month: number): number {
  const jsDay = getDay(new Date(year, month, 1)); // 0=Вс, 1=Пн...6=Сб
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Компактный формат времени для ячейки: "09–18" (desktop) / "9-18" (mobile). */
function formatCellTime(start: string, end: string, compact?: boolean): string {
  const startH = parseInt(start.split(":")[0], 10);
  const endH = parseInt(end.split(":")[0], 10);
  const startM = start.split(":")[1];
  const endM = end.split(":")[1];

  if (compact) {
    return `${startH}-${endH}`;
  }
  /* Desktop: показываем минуты только если не :00 */
  const s = startM === "00" ? `${String(startH).padStart(2, "0")}` : start;
  const e = endM === "00" ? `${String(endH).padStart(2, "0")}` : end;
  return `${s}–${e}`;
}

/**
 * Календарная сетка дней месяца с заголовками дней недели.
 * Клик — toggle дня; Shift+клик — выбор диапазона.
 * Показывает рабочие часы внутри ячейки, прошедшие дни приглушены.
 */
export function MonthGrid({
  currentMonth,
  daysInMonth,
  selectedDays,
  monthSchedule,
  onToggleDay,
  onRangeSelect,
  readOnly = false,
  isMobile = false,
}: MonthGridProps) {
  const t = useTranslations("Schedule.Weekdays");
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOffset = useMemo(
    () => getFirstDayOffset(year, month),
    [year, month]
  );

  /* Сегодня (начало дня) для определения прошедших дней. */
  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const handleClick = useCallback(
    (day: number, e: React.MouseEvent) => {
      if (readOnly) return;
      /* Не даём кликать по прошедшим дням */
      if (startOfDay(new Date(year, month, day)) < todayStart) return;

      if (e.shiftKey && onRangeSelect && selectedDays.length > 0) {
        const last = Math.max(...selectedDays);
        const from = Math.min(last, day);
        const to = Math.max(last, day);
        onRangeSelect(from, to);
      } else {
        onToggleDay(day);
      }
    },
    [
      readOnly,
      onToggleDay,
      onRangeSelect,
      selectedDays,
      year,
      month,
      todayStart,
    ]
  );

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-1.5">
      {/* Заголовки дней недели */}
      {WEEKDAYS.map((wd, i) => (
        <div
          key={wd}
          className={cn(
            "text-center text-xs font-medium py-1 select-none",
            i >= 5 ? "text-muted-foreground/60" : "text-muted-foreground"
          )}
        >
          {/* Мобилка: первая буква; Десктоп: полное сокращение */}
          {isMobile ? t(wd)[0] : t(wd)}
        </div>
      ))}

      {/* Пустые ячейки перед первым днём месяца */}
      {Array.from({ length: firstDayOffset }, (_, i) => (
        <div key={`empty-${i}`} />
      ))}

      {/* Ячейки дней */}
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
        const date = new Date(year, month, day);
        const isPast = startOfDay(date) < todayStart;
        const isSelected = selectedDays.includes(day);
        const daySchedule = monthSchedule[day];
        const hasSchedule =
          daySchedule &&
          !daySchedule.isClosed &&
          (daySchedule.workRanges?.length ?? 0) > 0;
        const isCurrentDay =
          date.getDate() === todayStart.getDate() &&
          date.getMonth() === todayStart.getMonth() &&
          date.getFullYear() === todayStart.getFullYear();
        const dayOfWeek = (firstDayOffset + day - 1) % 7; // 0=Пн...6=Вс
        const isWeekend = dayOfWeek >= 5;

        /* Текст рабочих часов */
        const workTimeText =
          hasSchedule && daySchedule.workRanges[0]
            ? formatCellTime(
                daySchedule.workRanges[0].start,
                daySchedule.workRanges[0].end,
                isMobile
              )
            : null;

        return (
          <button
            key={day}
            type="button"
            className={cn(
              /* Базовая ячейка */
              "relative flex flex-col items-center justify-center rounded-lg border transition-colors",
              "min-h-[44px] md:min-h-[56px] p-1",
              "text-sm font-medium select-none",

              /* Прошедший день — приглушённый, не интерактивный */
              isPast && "opacity-40 pointer-events-none",

              /* Выбранный — синяя рамка, без заливки */
              isSelected &&
                "border-2 border-blue-500 dark:border-blue-400 bg-transparent",

              /* Есть расписание (не выбран) — голубой фон */
              hasSchedule &&
                !isSelected &&
                "bg-blue-50/80 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",

              /* Выходной (не выбран, нет расписания) — серый */
              !hasSchedule &&
                !isSelected &&
                isWeekend &&
                "bg-muted/50 border-muted-foreground/10",

              /* Обычный день без расписания */
              !hasSchedule &&
                !isSelected &&
                !isWeekend &&
                "border-border bg-card",

              /* Сегодня (не выбран) — жирный */
              isCurrentDay && "font-semibold",

              /* Интерактивность */
              !isPast &&
                !readOnly &&
                "cursor-pointer hover:border-blue-300 dark:hover:border-blue-600",
              (isPast || readOnly) && "cursor-default"
            )}
            onClick={e => handleClick(day, e)}
            disabled={isPast || readOnly}
            aria-pressed={isSelected}
            aria-label={`${day}`}
          >
            {/* Номер дня */}
            <span
              className={cn(
                "leading-none",
                isCurrentDay && "text-blue-600 dark:text-blue-400"
              )}
            >
              {day}
            </span>

            {/* Рабочие часы — всегда видны (компактнее на мобилке) */}
            {workTimeText && (
              <span
                className={cn(
                  "text-[9px] md:text-[10px] leading-tight mt-0.5 truncate max-w-full",
                  "text-blue-600/70 dark:text-blue-400/70"
                )}
              >
                {workTimeText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
