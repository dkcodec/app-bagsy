"use client";

import { useCallback, useMemo } from "react";
import { getDay, isToday } from "date-fns";
import { cn } from "@/src/shared/utils/styles";
import { useTranslations } from "next-intl";
import type { MonthSchedule } from "@/src/shared/types/schedule";
import { formatScheduleTime } from "@/src/shared/utils/formater";

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
}

/** Дни недели начиная с понедельника (ISO). */
const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Получить смещение первого дня месяца (0=Пн, 6=Вс). */
function getFirstDayOffset(year: number, month: number): number {
  const jsDay = getDay(new Date(year, month, 1)); // 0=Вс, 1=Пн...6=Сб
  return jsDay === 0 ? 6 : jsDay - 1; // преобразуем в ISO (0=Пн)
}

/**
 * Календарная сетка дней месяца с заголовками дней недели.
 * Клик — toggle дня; Shift+клик — выбор диапазона.
 * На десктопе показывает рабочие часы внутри ячейки.
 */
export function MonthGrid({
  currentMonth,
  daysInMonth,
  selectedDays,
  monthSchedule,
  onToggleDay,
  onRangeSelect,
  readOnly = false,
}: MonthGridProps) {
  const t = useTranslations("Schedule.Weekdays");
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  /* Смещение первого дня (пустые ячейки перед 1-м числом). */
  const firstDayOffset = useMemo(
    () => getFirstDayOffset(year, month),
    [year, month]
  );

  const handleClick = useCallback(
    (day: number, e: React.MouseEvent) => {
      if (readOnly) return;
      if (e.shiftKey && onRangeSelect && selectedDays.length > 0) {
        const last = Math.max(...selectedDays);
        const from = Math.min(last, day);
        const to = Math.max(last, day);
        onRangeSelect(from, to);
      } else {
        onToggleDay(day);
      }
    },
    [readOnly, onToggleDay, onRangeSelect, selectedDays]
  );

  return (
    <div className="grid grid-cols-7 gap-1 lg:gap-2">
      {/* Заголовки дней недели */}
      {WEEKDAYS.map((wd, i) => (
        <div
          key={wd}
          className={cn(
            "text-center text-xs font-medium text-muted-foreground py-1 select-none",
            /* Сб, Вс — приглушённые */
            i >= 5 && "text-muted-foreground/60"
          )}
        >
          {t(wd)}
        </div>
      ))}

      {/* Пустые ячейки перед первым днём месяца */}
      {Array.from({ length: firstDayOffset }, (_, i) => (
        <div key={`empty-${i}`} />
      ))}

      {/* Ячейки дней */}
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
        const date = new Date(year, month, day);
        const isSelected = selectedDays.includes(day);
        const daySchedule = monthSchedule[day];
        const hasSchedule =
          daySchedule &&
          !daySchedule.isClosed &&
          (daySchedule.workRanges?.length ?? 0) > 0;
        const isCurrentDay = isToday(date);
        /* Суббота/воскресенье */
        const dayOfWeek = (firstDayOffset + day - 1) % 7; // 0=Пн...6=Вс
        const isWeekend = dayOfWeek >= 5;

        /* Текст рабочих часов для десктопной ячейки */
        const workTimeText =
          hasSchedule && daySchedule.workRanges[0]
            ? `${formatScheduleTime(daySchedule.workRanges[0].start)}–${formatScheduleTime(daySchedule.workRanges[0].end)}`
            : null;

        return (
          <button
            key={day}
            type="button"
            className={cn(
              /* Базовая ячейка */
              "relative flex flex-col items-center justify-center rounded-lg border transition-colors",
              "min-h-[40px] md:min-h-[64px] p-1",
              "text-sm font-medium cursor-pointer select-none",
              /* Обычное состояние */
              !isSelected && "border-border bg-card hover:bg-accent/10",
              /* Выбранный день */
              isSelected && "border-primary bg-primary text-primary-foreground",
              /* Сегодня (кольцо) */
              isCurrentDay &&
                !isSelected &&
                "ring-2 ring-primary ring-offset-1",
              /* Есть расписание — зелёный индикатор */
              hasSchedule &&
                !isSelected &&
                "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
              /* Закрыто / выходной — приглушённый */
              !hasSchedule &&
                !isSelected &&
                daySchedule?.isClosed !== undefined &&
                isWeekend &&
                "bg-muted/40 text-muted-foreground",
              /* Readonly */
              readOnly && "cursor-default opacity-70"
            )}
            onClick={e => handleClick(day, e)}
            disabled={readOnly}
            aria-pressed={isSelected}
            aria-label={`${day}`}
          >
            {/* Номер дня */}
            <span
              className={cn(
                "leading-none",
                isCurrentDay && isSelected && "font-bold"
              )}
            >
              {day}
            </span>

            {/* Рабочие часы — только десктоп */}
            {workTimeText && (
              <span
                className={cn(
                  "hidden md:block text-[10px] leading-tight mt-0.5 truncate max-w-full",
                  isSelected
                    ? "text-primary-foreground/80"
                    : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {workTimeText}
              </span>
            )}

            {/* Точка-индикатор расписания — мобилка */}
            {hasSchedule && (
              <span
                className={cn(
                  "lg:hidden absolute bottom-0.5 w-1.5 h-1.5 rounded-full",
                  isSelected ? "bg-primary-foreground/70" : "bg-emerald-500"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
