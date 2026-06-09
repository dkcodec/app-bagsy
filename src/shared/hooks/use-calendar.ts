"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarService } from "../services/calendar-service";
import { mapCalendarApiResponseToEvents } from "../utils/calendar-api-mapper";
import { getCalendarDateRange } from "../utils/calendar-date-range";
import { useCurrentUser } from "./use-users";
import { useGetEmployees } from "./user-staff";
import { EUserRole } from "../types/user";
import type { IEmployeeDto, TUserRole } from "../types/user";
import type { GetEmployeesParams } from "../services/employee-service";
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
  /** UUID локации для фильтрации (для Owner) */
  locationId?: string;
  /** UUID сотрудника для фильтрации (для Manager и выше) */
  employeeId?: string;
}

/**
 * Хук для загрузки данных календаря с поддержкой фильтров по ролям
 * Автоматически определяет доступные фильтры на основе роли пользователя
 */
export function useCalendar({
  selectedDate,
  view,
  locationId,
  employeeId,
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

    // Для Owner точка обязательна
    if (currentUser.role === EUserRole.OWNER && !locationId) {
      return null;
    }

    const params: GetCalendarParams = {
      from: dateRange.from,
      to: dateRange.to,
    };

    // Для Owner доступен фильтр по точке
    if (currentUser.role === EUserRole.OWNER && locationId) {
      params.location_id = locationId;
    }

    // Для Manager — фильтр по точке из профиля
    if (currentUser.role === EUserRole.MANAGER) {
      if (currentUser.location_id) {
        params.location_id = currentUser.location_id;
      }
    }

    // Для Manager и Owner доступен фильтр по сотруднику
    if (
      (currentUser.role === EUserRole.MANAGER ||
        currentUser.role === EUserRole.OWNER) &&
      employeeId
    ) {
      params.employee_id = employeeId;
    }

    return params;
  }, [currentUser, dateRange, locationId, employeeId]);

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

  // Загружаем список сотрудников для обогащения событий
  const employeesParams = useMemo<GetEmployeesParams | undefined>(() => {
    if (!currentUser) return undefined;

    // Для Staff - только свои записи, сотрудники не нужны
    if (currentUser.role === EUserRole.STAFF) {
      return undefined;
    }

    // Для Manager - сотрудники локации
    if (currentUser.role === EUserRole.MANAGER) {
      return {
        location_id: currentUser.location_id,
        role: [EUserRole.STAFF, EUserRole.MANAGER] as TUserRole[],
      };
    }

    // Для Owner - сотрудники выбранной локации или все
    if (currentUser.role === EUserRole.OWNER) {
      return {
        ...(locationId && { location_id: locationId }),
        role: [
          EUserRole.STAFF,
          EUserRole.OWNER,
          EUserRole.MANAGER,
        ] as TUserRole[],
      };
    }

    return undefined;
  }, [currentUser, locationId]);

  // Загружаем список сотрудников только для Manager и выше
  const employeesQuery = useGetEmployees(employeesParams);

  // Маппим данные из API в IEvent[]
  const events = useMemo<IEvent[]>(() => {
    if (!calendarQuery.data) return [];

    return mapCalendarApiResponseToEvents(calendarQuery.data);
  }, [calendarQuery.data, employeesQuery.data]);

  // Список мастеров для UI
  const masters = useMemo<IEmployeeDto[]>(() => {
    if (!currentUser) return [];
    if (currentUser.role === EUserRole.STAFF) return [currentUser];
    return employeesQuery.data?.employees ?? [];
  }, [currentUser, employeesQuery.data?.employees]);

  return {
    events,
    masters,
    isLoading: calendarQuery.isLoading || employeesQuery.isLoading,
    isError: calendarQuery.isError || employeesQuery.isError,
    error: calendarQuery.error || employeesQuery.error,
    refetch: () => {
      calendarQuery.refetch();
      employeesQuery.refetch();
    },
  };
}
