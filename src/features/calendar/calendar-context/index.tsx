"use client";

import { useEffect, useRef } from "react";

import {
  useCalendarStore,
  type CalendarState,
} from "@/src/features/calendar/calendar-context/store";

import type { Dispatch, SetStateAction } from "react";
import type {
  IEvent,
  IUser,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
}

export function CalendarProvider({
  children,
  users,
  events,
  initialDate,
  onDateChange,
}: {
  children: React.ReactNode;
  users: IUser[];
  events: IEvent[];
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}) {
  const setUsers = useCalendarStore((s: CalendarState) => s.setUsers);
  const setLocalEvents = useCalendarStore(
    (s: CalendarState) => s.setLocalEvents
  );
  const setSelectedDate = useCalendarStore(
    (s: CalendarState) => s.setSelectedDate
  );
  const selectedDateValue = useCalendarStore(
    (s: CalendarState) => s.selectedDate
  );

  const onDateChangeRef = useRef(onDateChange);
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
  }, [onDateChange]);

  useEffect(() => {
    setUsers(users);
    setLocalEvents(events);
    if (initialDate) setSelectedDate(initialDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, events, initialDate]);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    if (selectedDateValue) onDateChangeRef.current?.(selectedDateValue);
  }, [selectedDateValue]);

  return <>{children}</>;
}

export function useCalendar(): ICalendarContext {
  return useCalendarStore();
}
