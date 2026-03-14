"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Sun, Moon, Briefcase, Coffee } from "lucide-react";
import { Button } from "@/src/entities";
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
  selectedDays,
  daysInMonth,
  firstDayOffset,
  onApplyToSelected,
  onApplyToDays,
  onSelectDays,
  readOnly = false,
}: SchedulePresetsProps) {
  const t = useTranslations("Schedule.Presets");

  if (readOnly) return null;

  /* По чётным: чётные — рабочие, нечётные — выходные. Выбираем только рабочие. */
  const applyEvenDays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays = days.filter(d => d % 2 === 0);
    days.forEach(d => {
      onApplyToDays([d], d % 2 === 0 ? workDaySchedule : closedSchedule);
    });
    onSelectDays(workDays);
  }, [daysInMonth, onSelectDays, onApplyToDays]);

  /* По нечётным: нечётные — рабочие, чётные — выходные. Выбираем только рабочие. */
  const applyOddDays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays = days.filter(d => d % 2 !== 0);
    days.forEach(d => {
      onApplyToDays([d], d % 2 !== 0 ? workDaySchedule : closedSchedule);
    });
    onSelectDays(workDays);
  }, [daysInMonth, onSelectDays, onApplyToDays]);

  /* 5/2: Пн-Пт рабочие, Сб-Вс выходные. Выбираем только Пн-Пт. */
  const applyWeekdays = useCallback(() => {
    const days = allDays(daysInMonth);
    const workDays: number[] = [];
    days.forEach(d => {
      const dayOfWeek = (firstDayOffset + d - 1) % 7; // 0=Пн...6=Вс
      const isWeekend = dayOfWeek >= 5;
      onApplyToDays([d], isWeekend ? closedSchedule : workDaySchedule);
      if (!isWeekend) workDays.push(d);
    });
    onSelectDays(workDays);
  }, [daysInMonth, firstDayOffset, onSelectDays, onApplyToDays]);

  /* Добавить перерыв всем выбранным. */
  const addBreakToAll = useCallback(() => {
    if (selectedDays.length === 0) return;
    onApplyToSelected(draft => ({
      ...draft,
      isClosed: false,
      workRanges: draft.workRanges?.length
        ? draft.workRanges
        : [{ start: "09:00", end: "18:00" }],
      breaks: [...(draft.breaks ?? []), { start: "13:00", end: "14:00" }],
    }));
  }, [selectedDays, onApplyToSelected]);

  /* Выбрать все дни. */
  const selectAll = useCallback(() => {
    onSelectDays(allDays(daysInMonth));
  }, [daysInMonth, onSelectDays]);

  return (
    <div className="flex flex-wrap gap-2">
      {/* Быстрый выбор всех дней */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={selectAll}
      >
        <Calendar className="h-3.5 w-3.5" />
        {t("selectAll")}
      </Button>
      {/* 5/2 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={applyWeekdays}
      >
        <Briefcase className="h-3.5 w-3.5" />
        {t("weekdays")}
      </Button>
      {/* По чётным */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={applyEvenDays}
      >
        <Sun className="h-3.5 w-3.5" />
        {t("evenDays")}
      </Button>
      {/* По нечётным */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={applyOddDays}
      >
        <Moon className="h-3.5 w-3.5" />
        {t("oddDays")}
      </Button>
      {/* Перерыв всем выбранным */}
      {selectedDays.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={addBreakToAll}
        >
          <Coffee className="h-3.5 w-3.5" />
          {t("addBreakToAll")}
        </Button>
      )}
    </div>
  );
}
