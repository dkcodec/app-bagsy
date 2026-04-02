"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { startOfWeek, endOfWeek, format, getDay } from "date-fns";
import { ScheduleService } from "../services/schedule-service";
import type { ScheduleSlotDto } from "../types/schedule";

/**
 * Расписание одного дня недели (сгруппированное из date-based слотов)
 */
export interface WeekDaySchedule {
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
}

/**
 * Хук для загрузки расписания локации на текущую неделю
 * Группирует date-based слоты по дням недели (0=вс, 1=пн, ..., 6=сб)
 */
export function useLocationScheduleWeek(locationId: string | undefined) {
  // Диапазон текущей недели (пн — вс)
  const { mondayStr, sundayStr } = useMemo(() => {
    const now = new Date();
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const sunday = endOfWeek(now, { weekStartsOn: 1 });
    return {
      mondayStr: format(monday, "yyyy-MM-dd"),
      sundayStr: format(sunday, "yyyy-MM-dd"),
    };
  }, []);

  const query = useQuery({
    queryKey: ["location-schedule", locationId, mondayStr, sundayStr],
    queryFn: () =>
      ScheduleService.getLocationSchedule(locationId!, mondayStr, sundayStr),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Группируем слоты по дню недели
  const scheduleByDay = useMemo(() => {
    const result: Record<number, WeekDaySchedule[]> = {};
    if (!query.data?.slots) return result;

    query.data.slots.forEach((slot: ScheduleSlotDto) => {
      // Только рабочие слоты
      if (slot.type !== "work") return;

      const weekDay = getDay(new Date(slot.date + "T00:00:00"));
      if (!result[weekDay]) result[weekDay] = [];
      result[weekDay].push({
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
    });

    return result;
  }, [query.data]);

  return {
    scheduleByDay,
    isLoading: query.isLoading,
    error: query.error,
  };
}
