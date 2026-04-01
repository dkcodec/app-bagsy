"use client";

import { useEffect, useRef } from "react";

import {
  useCalendarStore,
  type CalendarState,
} from "@/src/features/calendar/calendar-context/store";
import { useCurrentUser } from "@/src/shared/hooks/use-users";

import type { Dispatch, SetStateAction } from "react";
import type {
  IEvent,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";
import { IEmployeeDto } from "@/src/shared/types/user";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedEmployeeId: IEmployeeDto["id"] | "all";
  setSelectedEmployeeId: (employeeId: IEmployeeDto["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  masters: IEmployeeDto[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  /** UUID локации (selectedLocationId || currentUser.location_id). */
  locationId: string | undefined;
}

export function CalendarProvider({
  children,
  masters,
  events,
  initialDate,
  initialEmployeeId,
  onDateChange,
  onEmployeeIdChange,
  selectedLocationId,
}: {
  children: React.ReactNode;
  masters: IEmployeeDto[];
  events: IEvent[];
  initialDate?: Date;
  /** UUID сотрудника из URL (для восстановления при перезагрузке) */
  initialEmployeeId?: string;
  onDateChange?: (date: Date) => void;
  onEmployeeIdChange?: (employeeId: string | undefined) => void;
  /** Выбранный UUID локации для owner (приоритет над currentUser.location_id) */
  selectedLocationId?: string;
}) {
  const { data: currentUser } = useCurrentUser();
  const setMasters = useCalendarStore((s: CalendarState) => s.setMasters);
  const setLocalEvents = useCalendarStore(
    (s: CalendarState) => s.setLocalEvents
  );
  const loadSchedule = useCalendarStore((s: CalendarState) => s.loadSchedule);
  const setSelectedDate = useCalendarStore(
    (s: CalendarState) => s.setSelectedDate
  );
  const selectedDateValue = useCalendarStore(
    (s: CalendarState) => s.selectedDate
  );
  const selectedEmployeeId = useCalendarStore(
    (s: CalendarState) => s.selectedEmployeeId
  );
  const setSelectedEmployeeId = useCalendarStore(
    (s: CalendarState) => s.setSelectedEmployeeId
  );
  const setLocationId = useCalendarStore((s: CalendarState) => s.setLocationId);

  const onDateChangeRef = useRef(onDateChange);
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
  }, [onDateChange]);

  const onEmployeeIdChangeRef = useRef(onEmployeeIdChange);
  useEffect(() => {
    onEmployeeIdChangeRef.current = onEmployeeIdChange;
  }, [onEmployeeIdChange]);

  // Синхронизируем мастеров и события по id (пропускаем если не изменились)
  const prevMastersIdsRef = useRef(masters.map(m => m.id).join(","));
  const prevEventsIdsRef = useRef(events.map(e => e.id).join(","));

  useEffect(() => {
    const mastersIds = masters.map(m => m.id).join(",");
    if (prevMastersIdsRef.current !== mastersIds) {
      setMasters(masters);
      prevMastersIdsRef.current = mastersIds;
    }

    const eventsIds = events.map(e => e.id).join(",");
    if (prevEventsIdsRef.current !== eventsIds) {
      setLocalEvents(events);
      prevEventsIdsRef.current = eventsIds;
    }

    if (initialDate) setSelectedDate(initialDate);
  }, [masters, events, initialDate]);

  // Восстанавливаем выбранного сотрудника из URL при маунте
  const didInitEmployeeRef = useRef(false);
  useEffect(() => {
    if (!didInitEmployeeRef.current && initialEmployeeId) {
      setSelectedEmployeeId(initialEmployeeId);
      didInitEmployeeRef.current = true;
    }
  }, [initialEmployeeId, setSelectedEmployeeId]);

  // Загружаем расписание при маунте и изменении location_id
  const locationIdToUse = selectedLocationId || currentUser?.location_id;
  const prevLocationIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    setLocationId(locationIdToUse ?? undefined);
    // При смене локации загружаем расписание с учётом выбранного сотрудника
    if (locationIdToUse && prevLocationIdRef.current !== locationIdToUse) {
      loadSchedule(locationIdToUse, selectedEmployeeId);
      prevLocationIdRef.current = locationIdToUse;
    }
  }, [locationIdToUse, setLocationId, loadSchedule, selectedEmployeeId]);

  // Отслеживаем изменения selectedEmployeeId: колбэк + перезагрузка расписания
  const prevSelectedEmployeeIdRef = useRef(selectedEmployeeId);

  useEffect(() => {
    if (prevSelectedEmployeeIdRef.current !== selectedEmployeeId) {
      // Колбэк наверх (undefined если "all")
      onEmployeeIdChangeRef.current?.(
        selectedEmployeeId !== "all" ? selectedEmployeeId : undefined
      );
      // Перезагружаем расписание: "all" → локации, конкретный → сотрудника
      loadSchedule(locationIdToUse, selectedEmployeeId);
      prevSelectedEmployeeIdRef.current = selectedEmployeeId;
    }
  }, [selectedEmployeeId, locationIdToUse, loadSchedule]);

  const didInitRef = useRef(false);
  const prevSelectedDateRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      prevSelectedDateRef.current = selectedDateValue;
      return;
    }

    if (
      selectedDateValue &&
      (!prevSelectedDateRef.current ||
        selectedDateValue.getTime() !== prevSelectedDateRef.current.getTime())
    ) {
      onDateChangeRef.current?.(selectedDateValue);
      prevSelectedDateRef.current = selectedDateValue;
    }
  }, [selectedDateValue]);

  return <>{children}</>;
}

export function useCalendar(): ICalendarContext {
  return useCalendarStore();
}
