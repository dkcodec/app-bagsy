"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { isSameDay } from "date-fns";

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

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 8, to: 17 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 0, to: 0 },
};

const VISIBLE_HOURS = { from: 7, to: 18 };

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
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] =
    useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  // Синхронизируем selectedDate с initialDate при изменении
  useEffect(() => {
    if (initialDate && !isSameDay(initialDate, selectedDate)) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, selectedDate]);
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
    "all"
  );

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);

  // Мемоизируем обработчик изменения даты
  const handleSelectDate = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setSelectedDate(date);
      onDateChange?.(date);
    },
    [onDateChange]
  );

  // Мемоизируем все функции для предотвращения ререндеров
  const memoizedSetSelectedUserId = useCallback(
    (userId: IUser["id"] | "all") => {
      setSelectedUserId(userId);
    },
    []
  );

  const memoizedSetBadgeVariant = useCallback((variant: TBadgeVariant) => {
    setBadgeVariant(variant);
  }, []);

  const memoizedSetVisibleHours = useCallback(
    (hours: TVisibleHours | ((prev: TVisibleHours) => TVisibleHours)) => {
      setVisibleHours(hours);
    },
    []
  );

  const memoizedSetWorkingHours = useCallback(
    (hours: TWorkingHours | ((prev: TWorkingHours) => TWorkingHours)) => {
      setWorkingHours(hours);
    },
    []
  );

  const memoizedSetLocalEvents = useCallback(
    (events: IEvent[] | ((prev: IEvent[]) => IEvent[])) => {
      setLocalEvents(events);
    },
    []
  );

  // Мемоизируем значение контекста для предотвращения ререндеров
  const contextValue = useMemo(
    () => ({
      selectedDate,
      setSelectedDate: handleSelectDate,
      selectedUserId,
      setSelectedUserId: memoizedSetSelectedUserId,
      badgeVariant,
      setBadgeVariant: memoizedSetBadgeVariant,
      users,
      visibleHours,
      setVisibleHours: memoizedSetVisibleHours,
      workingHours,
      setWorkingHours: memoizedSetWorkingHours,
      // If you go to the refetch approach, you can remove the localEvents and pass the events directly
      events: localEvents,
      setLocalEvents: memoizedSetLocalEvents,
    }),
    [
      selectedDate,
      handleSelectDate,
      selectedUserId,
      memoizedSetSelectedUserId,
      badgeVariant,
      memoizedSetBadgeVariant,
      users,
      visibleHours,
      memoizedSetVisibleHours,
      workingHours,
      memoizedSetWorkingHours,
      localEvents,
      memoizedSetLocalEvents,
    ]
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
