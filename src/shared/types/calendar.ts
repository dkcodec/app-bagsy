/**
 * Типы для календаря
 */

export type TCalendarView = "day" | "week" | "month" | "agenda";
export type TEventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "gray";

/** Все возможные цвета событий */
export const EVENT_COLORS: TEventColor[] = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray",
];

/** Маппинг TEventColor → Tailwind bg-класс */
export const EVENT_COLOR_BG: Record<TEventColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  red: "bg-red-600",
  yellow: "bg-yellow-600",
  purple: "bg-purple-600",
  orange: "bg-orange-600",
  gray: "bg-gray-600",
};

export type TBadgeVariant = "dot" | "colored" | "mixed";
/** Ключ — "YYYY-MM-DD", значение — массив рабочих интервалов (перерывы между ними закрашиваются) */
export type TWorkingHours = Record<string, { from: number; to: number }[]>;
export type TVisibleHours = { from: number; to: number };

/** Событие календаря (внутренний формат фронта) */
export interface IEvent {
  /** UUID записи */
  id: string;
  /** Телефон клиента */
  customerPhone: string;
  /** Имя клиента */
  customerName: string;
  /** UUID клиента */
  customerId: string;
  /** UUID сотрудника */
  employeeId: string;
  /** Имя сотрудника */
  employeeName: string;
  /** UUID локации */
  locationId: string;
  /** Название локации */
  locationName: string;
  /** С бэка всегда ISO 8601 с таймзоной; на бэк — с offset. */
  startDate: string;
  /** С бэка всегда ISO 8601 с таймзоной; на бэк — с offset. */
  endDate: string;
  /** Длительность в минутах */
  durationMinutes: number;
  /** Название услуги */
  title: string;
  /** UUID услуги */
  serviceId: string;
  price: number;
  status: string;
  color: TEventColor;
  comment: string;
  /** @deprecated используй customerPhone */
  clientPhone?: string;
  /** @deprecated используй employeeId */
  masterPhone?: string;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}

/**
 * Типы для API календаря (/api/v1/appointments/calendar)
 */

/** Параметры запроса календаря */
export interface GetCalendarParams {
  /** Дата начала в формате YYYY-MM-DD */
  from: string;
  /** Дата окончания в формате YYYY-MM-DD */
  to: string;
  /** UUID локации для фильтрации */
  location_id?: string;
  /** UUID сотрудника для фильтрации */
  employee_id?: string;
  /** Включать отменённые записи */
  include_cancelled?: boolean;
}

/** Элемент календаря из API (плоская структура) */
export interface CalendarEntryResponse {
  appointment_id: string;
  status: string;
  /** ISO 8601 с таймзоной */
  start_at: string;
  /** ISO 8601 с таймзоной */
  end_at: string;
  duration_minutes: number;
  price: number;
  service_id: string;
  service_name: string;
  service_color: string;
  employee_id: string;
  employee_name: string;
  location_id: string;
  location_name: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_comment: string;
}

/** Ответ API календаря */
export interface CalendarApiResponse {
  calendar: CalendarEntryResponse[];
}

/**
 * @deprecated Старые типы — оставлены для обратной совместимости.
 * Используй CalendarEntryResponse вместо CalendarApiItem.
 */
export type CalendarApiItem = CalendarEntryResponse;
export type CalendarBagsyInfo = never;
export type CalendarServiceInfo = never;
