"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/entities";
import { cn } from "@/src/shared/utils/styles";
import type { DaySchedule, MonthSchedule } from "@/src/shared/types/schedule";

export interface SchedulePresetsProps {
  selectedDays: number[];
  /** Количество дней в текущем месяце. */
  daysInMonth: number;
  /** Смещение первого дня месяца (0=Пн, 6=Вс). */
  firstDayOffset: number;
  monthSchedule: MonthSchedule;
  onApplyToSelected: (updater: (draft: DaySchedule) => DaySchedule) => void;
  onApplyToDays: (days: number[], schedule: DaySchedule) => void;
  /** Колбэк для выбора дней (setSelectedDays). */
  onSelectDays: (days: number[]) => void;
  readOnly?: boolean;
  /** Мобильный режим — горизонтальный скролл. */
  isMobile?: boolean;
  /** Регистрация авто-открытых дней (для отката при deselect). */
  onMarkAutoOpened: (days: number[]) => void;
  /** Вызывается после применения пресета (для открытия drawer на мобилке). */
  onAfterPreset?: () => void;
}

/** Пресет: рабочий день 09:00–18:00. */
const workDaySchedule: DaySchedule = {
  isClosed: false,
  workRanges: [{ start: "09:00", end: "18:00" }],
  breaks: [],
};

/** Пресет: выходной. */
const closedSchedule: DaySchedule = {
  isClosed: true,
  workRanges: [],
  breaks: [],
};

/** Все дни месяца как массив [1..N]. */
function allDays(daysInMonth: number): number[] {
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

export function SchedulePresets({
  daysInMonth,
  firstDayOffset,
  onApplyToDays,
  onSelectDays,
  readOnly = false,
  isMobile = false,
  onMarkAutoOpened,
  onAfterPreset,
}: SchedulePresetsProps) {
  const t = useTranslations("Schedule.Presets");
  const tRoot = useTranslations("Schedule");

  /* 5/2: Пн-Пт рабочие, Сб-Вс выходные. */
  const applyWeekdays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays: number[] = [];
    days.forEach(d => {
      const dayOfWeek = (firstDayOffset + d - 1) % 7;
      const isWeekend = dayOfWeek >= 5;
      onApplyToDays([d], isWeekend ? closedSchedule : workDaySchedule);
      if (!isWeekend) workDays.push(d);
    });
    onMarkAutoOpened(workDays);
    onSelectDays(workDays);
    onAfterPreset?.();
  }, [
    daysInMonth,
    firstDayOffset,
    onSelectDays,
    onApplyToDays,
    onMarkAutoOpened,
    onAfterPreset,
  ]);

  /* По чётным: чётные — рабочие, нечётные — выходные. */
  const applyEvenDays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays = days.filter(d => d % 2 === 0);
    days.forEach(d => {
      onApplyToDays([d], d % 2 === 0 ? workDaySchedule : closedSchedule);
    });
    onMarkAutoOpened(workDays);
    onSelectDays(workDays);
    onAfterPreset?.();
  }, [
    daysInMonth,
    onSelectDays,
    onApplyToDays,
    onMarkAutoOpened,
    onAfterPreset,
  ]);

  /* По нечётным: нечётные — рабочие, чётные — выходные. */
  const applyOddDays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays = days.filter(d => d % 2 !== 0);
    days.forEach(d => {
      onApplyToDays([d], d % 2 !== 0 ? workDaySchedule : closedSchedule);
    });
    onMarkAutoOpened(workDays);
    onSelectDays(workDays);
    onAfterPreset?.();
  }, [
    daysInMonth,
    onSelectDays,
    onApplyToDays,
    onMarkAutoOpened,
    onAfterPreset,
  ]);

  if (readOnly) return null;

  return (
    <div>
      <div
        className={cn(
          "flex gap-2",
          isMobile
            ? "overflow-x-auto no-scrollbar flex-nowrap pb-1 -mx-1 px-1"
            : "flex-wrap"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5", isMobile && "shrink-0")}
          onClick={applyWeekdays}
        >
          {t("weekdays")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5", isMobile && "shrink-0")}
          onClick={applyEvenDays}
        >
          {t("evenDays")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5", isMobile && "shrink-0")}
          onClick={applyOddDays}
        >
          {t("oddDays")}
        </Button>
      </div>

      {/* Shift hint — только десктоп */}
      {!isMobile && (
        <p className="text-xs text-muted-foreground mt-2">
          {tRoot("shiftHint")}
        </p>
      )}
    </div>
  );
}
