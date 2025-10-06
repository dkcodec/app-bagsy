"use client";

import { create } from "zustand";
import { isSameDay } from "date-fns";

import type {
  IEvent,
  IUser,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";

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

export type CalendarState = {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  workingHours: TWorkingHours;
  setWorkingHours: (
    updater: TWorkingHours | ((prev: TWorkingHours) => TWorkingHours)
  ) => void;
  visibleHours: TVisibleHours;
  setVisibleHours: (
    updater: TVisibleHours | ((prev: TVisibleHours) => TVisibleHours)
  ) => void;
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
  selectedUserId: "all",
  setSelectedUserId: (userId: IUser["id"] | "all") =>
    set({ selectedUserId: userId }),
  badgeVariant: "colored",
  setBadgeVariant: (variant: TBadgeVariant) => set({ badgeVariant: variant }),
  users: [],
  setUsers: (users: IUser[]) => set({ users }),
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
    })),
  events: [],
  setLocalEvents: (updater: IEvent[] | ((prev: IEvent[]) => IEvent[])) =>
    set(state => ({
      events:
        typeof updater === "function"
          ? (updater as (prev: IEvent[]) => IEvent[])(state.events)
          : updater,
    })),
}));
