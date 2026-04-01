import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isSameDay, startOfWeek, endOfWeek, format } from "date-fns";

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

/** Маппинг ScheduleSlotDto[] → TWorkingHours (группировка work-слотов по дню недели) */
export function mapScheduleSlotsToWorkingHours(
  slots: ScheduleSlotDto[]
): TWorkingHours | null {
  const result = emptyWorkingHours();
  const seen = new Set<number>();

  for (const slot of slots) {
    if (slot.type !== "work") continue;

    // date = "YYYY-MM-DD" → определяем день недели
    const date = new Date(slot.date + "T00:00:00");
    const dow = date.getDay(); // 0=вс, 6=сб

    const from = parseScheduleTime(slot.start_time).hour;
    let to = parseScheduleTime(slot.end_time).hour;
    // "00:00" в end_time → конец дня (24:00)
    if (to === 0 && from > 0) to = 24;

    if (!seen.has(dow)) {
      result[dow] = { from, to };
      seen.add(dow);
    } else {
      // Несколько рабочих слотов в один день — расширяем диапазон
      result[dow] = {
        from: Math.min(result[dow].from, from),
        to: Math.max(result[dow].to, to),
      };
    }
  }

  // Если нет ни одного work-слота — расписание не настроено, оставляем дефолты
  return seen.size > 0 ? result : null;
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
        // Делегируем в loadSchedule с "all" (расписание локации)
        await get().loadSchedule(locationId, "all");
      },
      loadSchedule: async (
        locationId: string | undefined,
        employeeId: string | "all"
      ) => {
        if (!locationId) return;
        try {
          const now = new Date();
          const weekStart = format(
            startOfWeek(now, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );
          const weekEnd = format(
            endOfWeek(now, { weekStartsOn: 1 }),
            "yyyy-MM-dd"
          );

          // "all" → расписание локации, конкретный сотрудник → его расписание
          const { slots } =
            employeeId === "all"
              ? await ScheduleService.getLocationSchedule(
                  locationId,
                  weekStart,
                  weekEnd
                )
              : await ScheduleService.getEmployeeSchedule(
                  employeeId,
                  weekStart,
                  weekEnd
                );

          const workingHours = mapScheduleSlotsToWorkingHours(slots);
          if (!workingHours) return; // Нет данных — оставляем текущие

          set({ workingHours });

          if (get().isVisibleHoursAuto) {
            const vis = deriveVisibleHoursFromWorkingHours(workingHours);
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
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
