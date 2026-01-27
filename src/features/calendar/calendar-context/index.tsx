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
import { IUserDto } from "@/src/shared/types/user";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedMasterPhone: IUserDto["phone"] | "all";
  setSelectedMasterPhone: (masterPhone: IUserDto["phone"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  masters: IUserDto[];
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
  /** Код точки (selectedPointCode || currentUser.point_code). Для выборов услуги в форме записи. */
  pointCode: string | undefined;
}

export function CalendarProvider({
  children,
  masters,
  events,
  initialDate,
  onDateChange,
  onMasterPhoneChange,
  selectedPointCode,
}: {
  children: React.ReactNode;
  masters: IUserDto[];
  events: IEvent[];
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
  onMasterPhoneChange?: (masterPhone: string | undefined) => void;
  /** Выбранный код точки для net_manager и self_owner (приоритет над currentUser.point_code) */
  selectedPointCode?: string;
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
  const selectedMasterPhone = useCalendarStore(
    (s: CalendarState) => s.selectedMasterPhone
  );
  const setPointCode = useCalendarStore((s: CalendarState) => s.setPointCode);

  const onDateChangeRef = useRef(onDateChange);
  useEffect(() => {
    onDateChangeRef.current = onDateChange;
  }, [onDateChange]);

  const onMasterPhoneChangeRef = useRef(onMasterPhoneChange);
  useEffect(() => {
    onMasterPhoneChangeRef.current = onMasterPhoneChange;
  }, [onMasterPhoneChange]);

  // Сохраняем предыдущие значения для сравнения мастеров и событий
  const prevMastersLengthRef = useRef<number>(masters.length);
  const prevEventsLengthRef = useRef<number>(events.length);
  const prevMastersPhonesRef = useRef<string>(
    masters.map(master => master.phone).join(",")
  );
  const prevEventsIdsRef = useRef<string>(events.map(e => e.id).join(","));

  useEffect(() => {
    // Обновляем masters только если массив действительно изменился
    const currentMastersPhones = masters.map(master => master.phone).join(",");
    if (
      prevMastersLengthRef.current !== masters.length ||
      prevMastersPhonesRef.current !== currentMastersPhones
    ) {
      setMasters(masters);
      prevMastersLengthRef.current = masters.length;
      prevMastersPhonesRef.current = currentMastersPhones;
    }

    // Обновляем events только если массив действительно изменился
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

  // Загружаем рабочие часы точки при изменении point_code
  // Используем selectedPointCode если он передан (для net_manager/self_owner),
  // иначе используем currentUser.point_code (для других ролей)
  const pointCodeToUse = selectedPointCode || currentUser?.point_code;
  const prevPointCodeRef = useRef<string | undefined>(pointCodeToUse);
  useEffect(() => {
    setPointCode(pointCodeToUse ?? undefined);
  }, [pointCodeToUse, setPointCode]);
  useEffect(() => {
    if (pointCodeToUse && prevPointCodeRef.current !== pointCodeToUse) {
      loadWorkingHours(pointCodeToUse);
      prevPointCodeRef.current = pointCodeToUse;
    }
  }, [pointCodeToUse, loadWorkingHours]);

  // Отслеживаем изменения selectedMasterPhone и вызываем колбэк (только если значение изменилось)
  const prevSelectedMasterPhoneRef = useRef<IUserDto["phone"] | "all">(
    selectedMasterPhone
  );
  const prevMasterPhoneRef = useRef<string | undefined>(
    selectedMasterPhone !== "all" ? selectedMasterPhone : undefined
  );

  useEffect(() => {
    if (prevSelectedMasterPhoneRef.current !== selectedMasterPhone) {
      const masterPhone =
        selectedMasterPhone !== "all" ? selectedMasterPhone : undefined;

      // Вызываем колбэк только если masterPhone действительно изменился
      if (prevMasterPhoneRef.current !== masterPhone) {
        onMasterPhoneChangeRef.current?.(masterPhone);
        prevMasterPhoneRef.current = masterPhone;
      }

      prevSelectedMasterPhoneRef.current = selectedMasterPhone;
    }
  }, [selectedMasterPhone]);

  const didInitRef = useRef(false);
  const prevSelectedDateRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      prevSelectedDateRef.current = selectedDateValue;
      return;
    }

    // Вызываем onDateChange только если дата действительно изменилась
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
