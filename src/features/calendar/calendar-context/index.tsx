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
  onDateChange,
  onEmployeeIdChange,
  selectedLocationId,
}: {
  children: React.ReactNode;
  masters: IEmployeeDto[];
  events: IEvent[];
  initialDate?: Date;
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
  const loadWorkingHours = useCalendarStore(
    (s: CalendarState) => s.loadWorkingHours
  );
  const setSelectedDate = useCalendarStore(
    (s: CalendarState) => s.setSelectedDate
  );
  const selectedDateValue = useCalendarStore(
    (s: CalendarState) => s.selectedDate
  );
  const selectedEmployeeId = useCalendarStore(
    (s: CalendarState) => s.selectedEmployeeId
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

  // Сравнение мастеров и событий по id
  const prevMastersLengthRef = useRef<number>(masters.length);
  const prevEventsLengthRef = useRef<number>(events.length);
  const prevMastersIdsRef = useRef<string>(
    masters.map(master => master.id).join(",")
  );
  const prevEventsIdsRef = useRef<string>(events.map(e => e.id).join(","));

  useEffect(() => {
    const currentMastersIds = masters.map(master => master.id).join(",");
    if (
      prevMastersLengthRef.current !== masters.length ||
      prevMastersIdsRef.current !== currentMastersIds
    ) {
      setMasters(masters);
      prevMastersLengthRef.current = masters.length;
      prevMastersIdsRef.current = currentMastersIds;
    }

    const currentEventsIds = events.map(e => e.id).join(",");
    if (
      prevEventsLengthRef.current !== events.length ||
      prevEventsIdsRef.current !== currentEventsIds
    ) {
      setLocalEvents(events);
      prevEventsLengthRef.current = events.length;
      prevEventsIdsRef.current = currentEventsIds;
    }

    if (initialDate) setSelectedDate(initialDate);
  }, [masters, events, initialDate]);

  // Загружаем рабочие часы локации при изменении location_id
  const locationIdToUse = selectedLocationId || currentUser?.location_id;
  const prevLocationIdRef = useRef<string | undefined>(locationIdToUse);
  useEffect(() => {
    setLocationId(locationIdToUse ?? undefined);
  }, [locationIdToUse, setLocationId]);
  useEffect(() => {
    if (locationIdToUse && prevLocationIdRef.current !== locationIdToUse) {
      loadWorkingHours(locationIdToUse);
      prevLocationIdRef.current = locationIdToUse;
    }
  }, [locationIdToUse, loadWorkingHours]);

  // Отслеживаем изменения selectedEmployeeId и вызываем колбэк
  const prevSelectedEmployeeIdRef = useRef<IEmployeeDto["id"] | "all">(
    selectedEmployeeId
  );
  const prevEmployeeIdRef = useRef<string | undefined>(
    selectedEmployeeId !== "all" ? selectedEmployeeId : undefined
  );

  useEffect(() => {
    if (prevSelectedEmployeeIdRef.current !== selectedEmployeeId) {
      const empId =
        selectedEmployeeId !== "all" ? selectedEmployeeId : undefined;

      if (prevEmployeeIdRef.current !== empId) {
        onEmployeeIdChangeRef.current?.(empId);
        prevEmployeeIdRef.current = empId;
      }

      prevSelectedEmployeeIdRef.current = selectedEmployeeId;
    }
  }, [selectedEmployeeId]);

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
