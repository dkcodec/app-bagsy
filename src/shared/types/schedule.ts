/**
 * Типы для страницы графика (помесячное расписание точки/мастера).
 * schedule_type точки: fixed — график точки фиксирован; mixed — мастер ставит себе на каждый месяц.
 */

/** Тип графика точки: фиксированный (мастер не меняет) или смешанный (мастер настраивает каждый месяц). */
export type ScheduleType = "fixed" | "mixed";

/** Режим редактирования: график точки или личный график мастера. */
export type ScheduleScope = "point" | "staff";

/** Интервал времени в формате HH:mm. */
export interface TimeRange {
  start: string;
  end: string;
}

/** Расписание одного дня: открыто/закрыто, рабочие интервалы, перерывы. */
export interface DaySchedule {
  isClosed: boolean;
  workRanges: TimeRange[];
  breaks: TimeRange[];
}

/** Расписание по дням месяца; ключ — номер дня (1..31). */
export type MonthSchedule = Record<number, DaySchedule>;

/** Контекст точки для прав: тип графика (приходит с API точки). */
export interface PointScheduleContext {
  schedule_type: ScheduleType;
}

/** Расширение пользователя: атрибуты для прав на график (когда появятся с API). */
export interface ScheduleUserFlags {
  can_work?: boolean;
  can_manage_point_schedule?: boolean;
}
