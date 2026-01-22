"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "../services/calendar-service";
import { mapCalendarApiResponseToEvents } from "../utils/calendar-api-mapper";
import { getCalendarDateRange } from "../utils/calendar-date-range";
import { useCurrentUser } from "./use-users";
import { useGetStaff } from "./user-staff";
import { EUserRole } from "../types/user";
import type { IUserDto, TUserRole } from "../types/user";
import type { GetStaffParams } from "../services/staff-service";
import type {
  GetCalendarParams,
  IEvent,
  TCalendarView,
} from "../types/calendar";

/**
 * Параметры для хука useCalendar
 */
export interface UseCalendarParams {
  /** Выбранная дата */
  selectedDate: Date;
  /** Вид календаря */
  view: TCalendarView;
  /** Код точки для фильтрации (для SelfOwner/NetManager) */
  pointCode?: string;
  /** Телефон мастера для фильтрации (для Manager и выше) */
  masterPhone?: string;
}

/**
 * Хук для загрузки данных календаря с поддержкой фильтров по ролям
 * Автоматически определяет доступные фильтры на основе роли пользователя
 */
export function useCalendar({
  selectedDate,
  view,
  pointCode,
  masterPhone,
}: UseCalendarParams) {
  // Получаем текущего пользователя для определения роли
  const { data: currentUser } = useCurrentUser();

  // Вычисляем диапазон дат на основе вида и выбранной даты
  const dateRange = useMemo(
    () => getCalendarDateRange(view, selectedDate),
    [view, selectedDate]
  );

  // Определяем параметры запроса на основе роли пользователя
  const calendarParams = useMemo<GetCalendarParams | null>(() => {
    if (!currentUser) return null;

    // Для SelfOwner и NetManager точка обязательна - не запрашиваем календарь без точки
    if (
      (currentUser.role === EUserRole.SELF_OWNER ||
        currentUser.role === EUserRole.NET_MANAGER) &&
      !pointCode
    ) {
      return null;
    }

    const params: GetCalendarParams = {
      from: dateRange.from,
      to: dateRange.to,
    };

    // Для SelfOwner и NetManager доступен фильтр по точке
    if (
      (currentUser.role === EUserRole.SELF_OWNER ||
        currentUser.role === EUserRole.NET_MANAGER) &&
      pointCode
    ) {
      params.point_code = pointCode;
    }

    // Для Manager и выше доступен фильтр по мастеру
    if (
      (currentUser.role === EUserRole.MANAGER ||
        currentUser.role === EUserRole.SELF_OWNER ||
        currentUser.role === EUserRole.NET_MANAGER ||
        currentUser.role === EUserRole.ADMIN) &&
      masterPhone
    ) {
      params.master_phone = masterPhone;
    }

    return params;
  }, [currentUser, dateRange, pointCode, masterPhone]);

  // Загружаем данные календаря
  const calendarQuery = useQuery({
    queryKey: ["calendar", calendarParams],
    queryFn: () => {
      if (!calendarParams) {
        throw new Error("Параметры запроса не определены");
      }
      return CalendarService.getCalendar(calendarParams);
    },
    enabled: !!calendarParams && !!currentUser,
    staleTime: 30 * 1000, // 30 секунд
  });

  // Загружаем список мастеров для обогащения событий
  // Для Staff - только текущий пользователь, для остальных - все мастера точки/сети
  const staffParams = useMemo<GetStaffParams | undefined>(() => {
    if (!currentUser) return undefined;

    // Для Staff - только свои записи, мастера не нужны
    if (currentUser.role === EUserRole.STAFF) {
      return undefined;
    }

    // Для Manager - мастера точки
    if (currentUser.role === EUserRole.MANAGER) {
      return {
        point_code: currentUser.point_code,
        role: [EUserRole.STAFF, EUserRole.MANAGER] as TUserRole[],
      };
    }

    // Для SelfOwner/NetManager - мастера выбранной точки или всех точек
    if (
      currentUser.role === EUserRole.SELF_OWNER ||
      currentUser.role === EUserRole.NET_MANAGER
    ) {
      return {
        ...(pointCode && { point_code: pointCode }),
        role: [EUserRole.STAFF, EUserRole.MANAGER] as TUserRole[],
      };
    }

    return undefined;
  }, [currentUser, pointCode]);

  // Загружаем список мастеров только для Manager и выше
  // Для Staff запрос не нужен, так как они видят только свои записи
  // useGetStaff автоматически отключит запрос, если staffParams === undefined
  const staffQuery = useGetStaff(staffParams);

  // Маппим данные из API в IEvent[]
  const events = useMemo<IEvent[]>(() => {
    if (!calendarQuery.data) return [];

    return mapCalendarApiResponseToEvents(calendarQuery.data);
  }, [calendarQuery.data, staffQuery.data]);

  // Список мастеров для UI: берём из staff ручки, а для Staff мастер = текущий пользователь
  const masters = useMemo<IUserDto[]>(() => {
    if (!currentUser) return [];
    if (currentUser.role === EUserRole.STAFF) return [currentUser];
    return staffQuery.data?.users ?? [];
  }, [currentUser, staffQuery.data?.users]);

  return {
    events,
    masters,
    isLoading: calendarQuery.isLoading || staffQuery.isLoading,
    isError: calendarQuery.isError || staffQuery.isError,
    error: calendarQuery.error || staffQuery.error,
    refetch: () => {
      calendarQuery.refetch();
      staffQuery.refetch();
    },
  };
}
