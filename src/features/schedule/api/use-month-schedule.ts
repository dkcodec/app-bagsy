"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { ScheduleService } from "@/src/shared/services/schedule-service";
import { splitWorkByBreaks, mergeAdjacentWork } from "@/src/shared/utils/schedule";
import type {
  MonthSchedule,
  ScheduleScope,
  ScheduleSlotDto,
} from "@/src/shared/types/schedule";

const QUERY_KEY_PREFIX = "month-schedule" as const;

// ============================================================
// Маппинг: API slots[] ↔ UI MonthSchedule
// ============================================================

/** Конвертирует плоский массив слотов API → MonthSchedule (Record<day, DaySchedule>). */
function slotsToMonthSchedule(
  slots: ScheduleSlotDto[],
  year: number,
  month: number
): MonthSchedule {
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const result: MonthSchedule = {};

  /* Инициализируем все дни как выходные. */
  for (let d = 1; d <= daysInMonth; d++) {
    result[d] = { isClosed: true, workRanges: [], breaks: [] };
  }

  /* Раскладываем слоты по дням. */
  for (const slot of slots) {
    const day = parseInt(slot.date.split("-")[2], 10);
    if (!result[day]) continue;

    const range = { start: slot.start_time, end: slot.end_time };
    if (slot.type === "work") {
      result[day].workRanges.push(range);
      result[day].isClosed = false;
    } else {
      result[day].breaks.push(range);
    }
  }

  /* Сортируем интервалы и склеиваем split work-ranges обратно. */
  for (let d = 1; d <= daysInMonth; d++) {
    result[d].workRanges.sort((a, b) => a.start.localeCompare(b.start));
    result[d].breaks.sort((a, b) => a.start.localeCompare(b.start));
    /* Обратная операция к splitWorkByBreaks — юзер видит [9-18] вместо [9-13, 14-18]. */
    result[d].workRanges = mergeAdjacentWork(result[d].workRanges, result[d].breaks);
  }

  return result;
}

/** Конвертирует MonthSchedule → плоский массив слотов для PUT API. */
function monthScheduleToSlots(
  schedule: MonthSchedule,
  year: number,
  month: number
): Omit<ScheduleSlotDto, "id">[] {
  const slots: Omit<ScheduleSlotDto, "id">[] = [];

  for (const [dayStr, day] of Object.entries(schedule)) {
    if (day.isClosed) continue;

    const date = format(new Date(year, month, Number(dayStr)), "yyyy-MM-dd");

    /* Разрезаем рабочие интервалы по перерывам → неперекрывающиеся слоты. */
    const split = splitWorkByBreaks(day.workRanges, day.breaks);
    for (const s of split) {
      slots.push({ date, type: s.type, start_time: s.start, end_time: s.end });
    }
  }

  return slots;
}

// ============================================================
// Публичные утилиты
// ============================================================

/** Строит пустой MonthSchedule для указанного месяца (дни 1..N). */
export function buildEmptyMonthSchedule(
  year: number,
  month: number
): MonthSchedule {
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const result: MonthSchedule = {};
  for (let d = 1; d <= daysInMonth; d++) {
    result[d] = { isClosed: true, workRanges: [], breaks: [] };
  }
  return result;
}

// ============================================================
// Хук
// ============================================================

/**
 * Загрузка и сохранение расписания на месяц.
 * @param scope  "staff" → employee-schedules, "point" → location-schedules
 * @param date   любой день целевого месяца
 * @param entityId  UUID сотрудника (staff) или локации (point)
 */
export function useMonthSchedule(
  scope: ScheduleScope,
  date: Date,
  entityId: string | undefined
) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const queryKey = [QUERY_KEY_PREFIX, scope, entityId, year, month] as const;
  const queryClient = useQueryClient();

  /* Границы месяца в формате YYYY-MM-DD. */
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const startDate = format(new Date(year, month, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month, daysInMonth), "yyyy-MM-dd");

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const resp =
        scope === "staff"
          ? await ScheduleService.getEmployeeSchedule(
              entityId!,
              startDate,
              endDate
            )
          : await ScheduleService.getLocationSchedule(
              entityId!,
              startDate,
              endDate
            );
      return slotsToMonthSchedule(resp.slots, year, month);
    },
    enabled: !!entityId,
  });

  const mutation = useMutation({
    mutationFn: async ({
      data,
      days,
    }: {
      data: MonthSchedule;
      days?: number[];
    }) => {
      /* Если указаны конкретные дни — сужаем start/end и фильтруем слоты. */
      const targetDays = days && days.length > 0 ? days : undefined;
      const rangeStart = targetDays
        ? format(new Date(year, month, Math.min(...targetDays)), "yyyy-MM-dd")
        : startDate;
      const rangeEnd = targetDays
        ? format(new Date(year, month, Math.max(...targetDays)), "yyyy-MM-dd")
        : endDate;

      /* Конвертируем только нужные дни в слоты. */
      const filteredSchedule = targetDays
        ? (Object.fromEntries(
            targetDays.map(d => [d, data[d]])
          ) as MonthSchedule)
        : data;
      const slots = monthScheduleToSlots(filteredSchedule, year, month);

      const body = { start: rangeStart, end: rangeEnd, slots };
      if (scope === "staff") {
        await ScheduleService.saveEmployeeSchedule(entityId!, body);
      } else {
        await ScheduleService.saveLocationSchedule(entityId!, body);
      }
    },
    onSuccess: (_, { data }) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  /* Стабильный fallback — не создаём новый объект каждый рендер. */
  const emptySchedule = useMemo(
    () => buildEmptyMonthSchedule(year, month),
    [year, month]
  );

  const monthStart = startOfMonth(date);
  const prevMonth = subMonths(monthStart, 1);
  const nextMonth = addMonths(monthStart, 1);

  return {
    data: query.data ?? emptySchedule,
    /** Timestamp последнего обновления данных — стабильный примитив для отслеживания изменений. */
    dataUpdatedAt: query.dataUpdatedAt,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    /** Сохранить расписание. days — только изменённые дни (сужает start/end). */
    save: (data: MonthSchedule, days?: number[]) =>
      mutation.mutateAsync({ data, days }),
    isSaving: mutation.isPending,
    year,
    month,
    prevMonth,
    nextMonth,
    daysInMonth,
  };
}
