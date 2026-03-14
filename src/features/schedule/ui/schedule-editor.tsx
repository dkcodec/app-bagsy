"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Plus, X } from "lucide-react";
import { Label } from "@/src/entities/label";
import { Button } from "@/src/entities";
import { Separator } from "@/src/entities";
import { TimeRangeRow } from "./time-range-row";
import type {
  DaySchedule,
  MonthSchedule,
  TimeRange,
} from "@/src/shared/types/schedule";

export interface ScheduleEditorProps {
  selectedDays: number[];
  monthSchedule: MonthSchedule;
  onApplyToSelected: (updater: (draft: DaySchedule) => DaySchedule) => void;
  readOnly?: boolean;
}

const defaultWorkRange: TimeRange = { start: "09:00", end: "18:00" };

export function ScheduleEditor({
  selectedDays,
  monthSchedule,
  onApplyToSelected,
  readOnly = false,
}: ScheduleEditorProps) {
  const t = useTranslations("Schedule.Editor");

  /* Берём первый выбранный день как репрезентативный. */
  const rep = selectedDays[0] ?? null;
  const daySchedule: DaySchedule = rep
    ? (monthSchedule[rep] ?? {
        isClosed: false,
        workRanges: [defaultWorkRange],
        breaks: [],
      })
    : { isClosed: false, workRanges: [defaultWorkRange], breaks: [] };

  /* Проверка: у выбранных дней разное время? */
  const hasMixedTimes = useMemo(() => {
    if (selectedDays.length < 2) return false;
    const serialize = (d: DaySchedule) =>
      JSON.stringify(d.workRanges) +
      "|" +
      JSON.stringify(d.breaks) +
      "|" +
      d.isClosed;
    const first = serialize(daySchedule);
    return selectedDays.some(day => {
      const s = monthSchedule[day] ?? {
        isClosed: false,
        workRanges: [defaultWorkRange],
        breaks: [],
      };
      return serialize(s) !== first;
    });
  }, [selectedDays, monthSchedule, daySchedule]);

  /* Рабочие интервалы с фолбэком. */
  const workRanges = daySchedule.workRanges.length
    ? daySchedule.workRanges
    : [defaultWorkRange];

  const setWorkRanges = useCallback(
    (ranges: TimeRange[]) =>
      onApplyToSelected(d => ({ ...d, isClosed: false, workRanges: ranges })),
    [onApplyToSelected]
  );

  const setBreaks = useCallback(
    (breaks: TimeRange[]) => onApplyToSelected(d => ({ ...d, breaks })),
    [onApplyToSelected]
  );

  /* Сделать выходным. */
  const makeClosed = useCallback(() => {
    onApplyToSelected(() => ({ isClosed: true, workRanges: [], breaks: [] }));
  }, [onApplyToSelected]);

  /* Открыть день (если закрыт). */
  const makeOpen = useCallback(() => {
    onApplyToSelected(() => ({
      isClosed: false,
      workRanges: [defaultWorkRange],
      breaks: [],
    }));
  }, [onApplyToSelected]);

  /* Нет выбранных дней — подсказка. */
  if (selectedDays.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t("selectDaysHint")}
      </p>
    );
  }

  /* День закрыт — показать кнопку открытия. */
  if (daySchedule.isClosed) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-muted-foreground">{t("dayIsClosed")}</p>
        {!readOnly && (
          <Button variant="default" size="sm" onClick={makeOpen}>
            {t("makeOpen")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Предупреждение: у выбранных дней разное время */}
      {hasMixedTimes && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t("mixedTimesWarning")}</span>
        </div>
      )}

      {/* Рабочие интервалы */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("workHours")}
        </Label>
        {workRanges.map((range, idx) => (
          <TimeRangeRow
            key={idx}
            value={range}
            labelFrom={t("from")}
            labelTo={t("to")}
            disabled={readOnly}
            onChange={v => {
              const next = [...workRanges];
              next[idx] = v;
              setWorkRanges(next);
            }}
            onRemove={
              workRanges.length > 1
                ? () => {
                    const next = workRanges.filter((_, i) => i !== idx);
                    setWorkRanges(next.length ? next : [defaultWorkRange]);
                  }
                : undefined
            }
          />
        ))}
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() =>
              setWorkRanges([...workRanges, { start: "12:00", end: "13:00" }])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addWorkRange")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Перерывы */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("breaks")}
        </Label>
        {daySchedule.breaks.length === 0 && (
          <p className="text-xs text-muted-foreground">{t("noBreaks")}</p>
        )}
        {daySchedule.breaks.map((br, idx) => (
          <TimeRangeRow
            key={idx}
            value={br}
            labelFrom={t("from")}
            labelTo={t("to")}
            disabled={readOnly}
            onChange={v => {
              const next = [...daySchedule.breaks];
              next[idx] = v;
              setBreaks(next);
            }}
            onRemove={() =>
              setBreaks(daySchedule.breaks.filter((_, i) => i !== idx))
            }
          />
        ))}
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() =>
              setBreaks([
                ...daySchedule.breaks,
                { start: "13:00", end: "14:00" },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addBreak")}
          </Button>
        )}
      </div>

      {/* Кнопка "Сделать выходным" — внизу, менее приоритетная */}
      {!readOnly && (
        <>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={makeClosed}
          >
            <X className="h-3.5 w-3.5" />
            {t("makeClosed")}
          </Button>
        </>
      )}
    </div>
  );
}
