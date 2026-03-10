import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isSameDay } from "date-fns";

import type {
  IEvent,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";
import { IEmployeeDto } from "@/src/shared/types/user";
import { LocationService } from "@/src/shared/services/location-service";
import { parseScheduleTime } from "@/src/shared/utils/datetime";

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

/** Маппинг ISchedule[] (open/close) в TWorkingHours. Экспорт для calendar-settings. */
export function mapLocationScheduleToWorkingHours(
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
    const from = parseScheduleTime(day.open).hour;
    const to = parseScheduleTime(day.close).hour;
    result[jsDay] = { from, to };
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
  selectedEmployeeId: IEmployeeDto["id"] | "all";
  setSelectedEmployeeId: (employeeId: IEmployeeDto["id"] | "all") => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  masters: IEmployeeDto[];
  setMasters: (masters: IEmployeeDto[]) => void;
  workingHours: TWorkingHours;
  setWorkingHours: (
    updater: TWorkingHours | ((prev: TWorkingHours) => TWorkingHours)
  ) => void;
  loadWorkingHours: (locationId: string | undefined) => Promise<void>;
  visibleHours: TVisibleHours;
  setVisibleHours: (
    updater: TVisibleHours | ((prev: TVisibleHours) => TVisibleHours)
  ) => void;
  /**
   * Если true — visibleHours ещё не задавались пользователем,
   * и их можно автоподстроить под workingHours локации.
   */
  isVisibleHoursAuto: boolean;
  events: IEvent[];
  setLocalEvents: (updater: IEvent[] | ((prev: IEvent[]) => IEvent[])) => void;
  /** UUID локации: selectedLocationId || currentUser.location_id. Для выбора услуги в форме записи. */
  locationId: string | undefined;
  setLocationId: (v: string | undefined) => void;
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date(),
      setSelectedDate: (date: Date | undefined) => {
        if (!date) return;
        const current = get().selectedDate;
        if (isSameDay(current, date)) return;
        set({ selectedDate: date });
      },
      selectedEmployeeId: "all",
      setSelectedEmployeeId: (employeeId: IEmployeeDto["id"] | "all") =>
        set({ selectedEmployeeId: employeeId }),
      badgeVariant: "colored",
      setBadgeVariant: (variant: TBadgeVariant) =>
        set({ badgeVariant: variant }),
      masters: [],
      setMasters: (masters: IEmployeeDto[]) => set({ masters }),
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
      loadWorkingHours: async (locationId: string | undefined) => {
        if (!locationId) return;
        try {
          const location = await LocationService.getLocation(locationId);
          // TODO: schedule данные пока не приходят из GET /api/v1/locations/{id}
          // Когда бэк добавит schedule — парсить и маппить как раньше
          void location;
        } catch {
          // Используем дефолтные рабочие часы при ошибке
        }
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
      locationId: undefined,
      setLocationId: (v: string | undefined) => set({ locationId: v }),
    }),
    {
      name: "calendar-store",
      partialize: state => ({
        badgeVariant: state.badgeVariant,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
