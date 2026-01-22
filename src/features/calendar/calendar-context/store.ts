"use client";

import { create } from "zustand";
import { isSameDay } from "date-fns";

import type {
  IEvent,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";
import { IUserDto } from "@/src/shared/types/user";
import { PointService } from "@/src/shared/services/point-service";

const WORKING_HOURS: TWorkingHours = {
  0: { from: 8, to: 17 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 0, to: 0 },
};

const VISIBLE_HOURS: TVisibleHours = { from: 7, to: 18 };

function parseHour(time: string): number | null {
  // Ожидаем "HH:mm" или "HH:mm:ss" и берём число часов до первого двоеточия.
  const hour = Number(time?.split(":")[0]);
  return Number.isFinite(hour) ? hour : null;
}

function clampHour(hour: number) {
  return Math.min(24, Math.max(0, hour));
}

function emptyWorkingHours(): TWorkingHours {
  // JS Date.getDay(): 0..6 (вс..сб)
  return {
    0: { from: 0, to: 0 },
    1: { from: 0, to: 0 },
    2: { from: 0, to: 0 },
    3: { from: 0, to: 0 },
    4: { from: 0, to: 0 },
    5: { from: 0, to: 0 },
    6: { from: 0, to: 0 },
  };
}

function mapPointScheduleToWorkingHours(
  schedule: Array<{
    all_day: boolean;
    open: string;
    close: string;
    week_day: number;
  }>
): TWorkingHours {
  // API: week_day 0..6 (вс..сб). JS: 0..6 (вс..сб)
  // 0 = воскресенье всегда
  const result = emptyWorkingHours();

  for (const day of schedule ?? []) {
    const jsDay = Number(day.week_day);
    if (day.all_day) {
      result[jsDay] = { from: 0, to: 24 };
      continue;
    }
    const from = parseHour(day.open);
    const to = parseHour(day.close);
    result[jsDay] = {
      from: from ?? 0,
      to: to ?? 0,
    };
  }

  return result;
}

function deriveVisibleHoursFromWorkingHours(
  workingHours: TWorkingHours
): TVisibleHours | null {
  // Если рабочие часы не заданы — не трогаем visibleHours
  const active = Object.values(workingHours ?? {}).filter(
    v => v && v.to > v.from
  );
  if (!active.length) return null;

  const minFrom = Math.min(...active.map(v => v.from));
  const maxTo = Math.max(...active.map(v => v.to));

  // Небольшой запас, чтобы сетка не упиралась в край.
  return { from: clampHour(minFrom - 1), to: clampHour(maxTo + 1) };
}

export type CalendarState = {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedMasterPhone: IUserDto["phone"] | "all";
  setSelectedMasterPhone: (masterPhone: IUserDto["phone"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  masters: IUserDto[];
  setMasters: (masters: IUserDto[]) => void;
  workingHours: TWorkingHours;
  setWorkingHours: (
    updater: TWorkingHours | ((prev: TWorkingHours) => TWorkingHours)
  ) => void;
  loadWorkingHours: (pointCode: string | undefined) => Promise<void>;
  visibleHours: TVisibleHours;
  setVisibleHours: (
    updater: TVisibleHours | ((prev: TVisibleHours) => TVisibleHours)
  ) => void;
  /**
   * Если true — visibleHours ещё не задавались пользователем,
   * и их можно автоподстроить под workingHours точки.
   */
  isVisibleHoursAuto: boolean;
  events: IEvent[];
  setLocalEvents: (updater: IEvent[] | ((prev: IEvent[]) => IEvent[])) => void;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  setSelectedDate: (date: Date | undefined) => {
    if (!date) return;
    const current = get().selectedDate;
    if (isSameDay(current, date)) return;
    set({ selectedDate: date });
  },
  selectedMasterPhone: "all",
  setSelectedMasterPhone: (masterPhone: IUserDto["phone"] | "all") =>
    set({ selectedMasterPhone: masterPhone }),
  badgeVariant: "colored",
  setBadgeVariant: (variant: TBadgeVariant) => set({ badgeVariant: variant }),
  masters: [],
  setMasters: (masters: IUserDto[]) => set({ masters }),
  workingHours: WORKING_HOURS,
  setWorkingHours: (
    updater: TWorkingHours | ((prev: TWorkingHours) => TWorkingHours)
  ) =>
    set(state => ({
      workingHours:
        typeof updater === "function"
          ? (updater as (prev: TWorkingHours) => TWorkingHours)(
              state.workingHours
            )
          : updater,
    })),
  loadWorkingHours: async (pointCode: string | undefined) => {
    if (!pointCode) return;
    const point = await PointService.getPoint(pointCode);
    const workingHours = mapPointScheduleToWorkingHours(point.schedule);
    const nextVisibleHours = deriveVisibleHoursFromWorkingHours(workingHours);

    set(state => ({
      workingHours,
      ...(state.isVisibleHoursAuto && nextVisibleHours
        ? { visibleHours: nextVisibleHours }
        : {}),
    }));
  },
  visibleHours: VISIBLE_HOURS,
  setVisibleHours: (
    updater: TVisibleHours | ((prev: TVisibleHours) => TVisibleHours)
  ) =>
    set(state => ({
      visibleHours:
        typeof updater === "function"
          ? (updater as (prev: TVisibleHours) => TVisibleHours)(
              state.visibleHours
            )
          : updater,
      isVisibleHoursAuto: false,
    })),
  isVisibleHoursAuto: true,
  events: [],
  setLocalEvents: (updater: IEvent[] | ((prev: IEvent[]) => IEvent[])) =>
    set(state => ({
      events:
        typeof updater === "function"
          ? (updater as (prev: IEvent[]) => IEvent[])(state.events)
          : updater,
    })),
}));
