"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MonthSchedule, ScheduleScope } from "@/src/shared/types/schedule";
import {
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
} from "date-fns";

const QUERY_KEY_PREFIX = "month-schedule" as const;

/** Пустое расписание одного дня (закрыто, без интервалов). */
function emptyDaySchedule() {
  return {
    isClosed: true,
    workRanges: [] as { start: string; end: string }[],
    breaks: [] as { start: string; end: string }[],
  };
}

/** Строит пустой MonthSchedule для указанного месяца (дни 1..N). */
export function buildEmptyMonthSchedule(year: number, month: number): MonthSchedule {
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const result: MonthSchedule = {};
  for (let d = 1; d <= daysInMonth; d++) {
    result[d] = emptyDaySchedule();
  }
  return result;
}

/** TODO: заменить на реальный API — загрузка графика точки/мастера на месяц. */
async function fetchMonthSchedule(
  _scope: ScheduleScope,
  _year: number,
  _month: number
): Promise<MonthSchedule> {
  await new Promise((r) => setTimeout(r, 200));
  const daysInMonth = getDaysInMonth(new Date(_year, _month, 1));
  const result: MonthSchedule = {};
  for (let d = 1; d <= daysInMonth; d++) {
    result[d] = emptyDaySchedule();
  }
  return result;
}

/** TODO: заменить на реальный API — сохранение графика на месяц. */
async function saveMonthSchedule(
  _scope: ScheduleScope,
  _year: number,
  _month: number,
  data: MonthSchedule
): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  void data;
}

export function useMonthSchedule(scope: ScheduleScope, date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const queryKey = [QUERY_KEY_PREFIX, scope, year, month] as const;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => fetchMonthSchedule(scope, year, month),
    placeholderData: () => buildEmptyMonthSchedule(year, month),
  });

  const mutation = useMutation({
    mutationFn: (data: MonthSchedule) =>
      saveMonthSchedule(scope, year, month, data),
    onSuccess: (_, data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const monthStart = startOfMonth(date);
  const prevMonth = subMonths(monthStart, 1);
  const nextMonth = addMonths(monthStart, 1);

  return {
    data: query.data ?? buildEmptyMonthSchedule(year, month),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
    year,
    month,
    prevMonth,
    nextMonth,
    daysInMonth: getDaysInMonth(date),
  };
}
