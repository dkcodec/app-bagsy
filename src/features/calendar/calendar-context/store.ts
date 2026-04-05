import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

import type {
  IEvent,
  TBadgeVariant,
  TVisibleHours,
  TWorkingHours,
} from "@/src/shared/types/calendar";
import { IEmployeeDto } from "@/src/shared/types/user";
import { ScheduleService } from "@/src/shared/services/schedule-service";
import type { ScheduleSlotDto } from "@/src/shared/types/schedule";
import { parseScheduleTime } from "@/src/shared/utils/datetime";

const VISIBLE_HOURS: TVisibleHours = { from: 7, to: 18 };

function clampHour(hour: number) {
  return Math.min(24, Math.max(0, hour));
}

/** Маппинг ScheduleSlotDto[] → TWorkingHours (группировка work-слотов по дате "YYYY-MM-DD") */
export function mapScheduleSlotsToWorkingHours(
  slots: ScheduleSlotDto[]
): TWorkingHours | null {
  const result: TWorkingHours = {};
  let hasWork = false;

  for (const slot of slots) {
    if (slot.type !== "work") continue;
    hasWork = true;

    const dateKey = slot.date; // "YYYY-MM-DD"
    const from = parseScheduleTime(slot.start_time).hour;
    let to = parseScheduleTime(slot.end_time).hour;
    // "00:00" в end_time → конец дня (24:00)
    if (to === 0 && from > 0) to = 24;

    if (!result[dateKey]) {
      result[dateKey] = { from, to };
    } else {
      // Несколько рабочих слотов в один день — расширяем диапазон
      result[dateKey] = {
        from: Math.min(result[dateKey].from, from),
        to: Math.max(result[dateKey].to, to),
      };
    }
  }

  return hasWork ? result : null;
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
  /** Загруженный диапазон дат расписания */
  loadedScheduleRange: { from: string; to: string } | null;
  loadWorkingHours: (locationId: string | undefined) => Promise<void>;
  /** Загрузить расписание конкретного сотрудника (или вернуть расписание локации если "all") */
  loadSchedule: (
    locationId: string | undefined,
    employeeId: string | "all"
  ) => Promise<void>;
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
      workingHours: {},
      loadedScheduleRange: null,
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
        // Делегируем в loadSchedule с "all" (расписание локации)
        await get().loadSchedule(locationId, "all");
      },
      loadSchedule: async (
        locationId: string | undefined,
        employeeId: string | "all"
      ) => {
        if (!locationId) return;
        try {
          // Запрашиваем месяц selectedDate + overflow дни для недельного вида
          const selectedDate = get().selectedDate;
          const rangeFrom = format(
            startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );
          const rangeTo = format(
            endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );

          // "all" → расписание локации, конкретный сотрудник → его расписание
          const { slots } =
            employeeId === "all"
              ? await ScheduleService.getLocationSchedule(
                  locationId,
                  rangeFrom,
                  rangeTo
                )
              : await ScheduleService.getEmployeeSchedule(
                  employeeId,
                  rangeFrom,
                  rangeTo
                );

          const newHours = mapScheduleSlotsToWorkingHours(slots);
          if (!newHours) return; // Нет данных — оставляем текущие

          // Мерджим с существующими данными чтобы не терять соседние месяцы
          const merged = { ...get().workingHours, ...newHours };
          set({
            workingHours: merged,
            loadedScheduleRange: { from: rangeFrom, to: rangeTo },
          });

          if (get().isVisibleHoursAuto) {
            const vis = deriveVisibleHoursFromWorkingHours(merged);
            if (vis) set({ visibleHours: vis });
          }
        } catch {
          // При ошибке оставляем текущие рабочие часы
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
        locationId: state.locationId,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
