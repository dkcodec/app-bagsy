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
export type TBadgeVariant = "dot" | "colored" | "mixed";
export type TWorkingHours = { [key: number]: { from: number; to: number } };
export type TVisibleHours = { from: number; to: number };

export interface IEvent {
  id: number;
  clientPhone: string;
  /** С бэка всегда ISO 8601 с таймзоной; на бэк — с offset. */
  startDate: string;
  /** С бэка всегда ISO 8601 с таймзоной; на бэк — с offset. */
  endDate: string;
  title: string;
  masterPhone: string;
  pointCode: string;
  price: number;
  /** С бэка всегда ISO 8601 с таймзоной. */
  createdAt: string;
  /** С бэка всегда ISO 8601 с таймзоной. */
  updatedAt: string;
  status: string;
  color: TEventColor;
  comment: string;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}

/**
 * Типы для API календаря
 */

/**
 * Параметры запроса календаря
 */
export interface GetCalendarParams {
  /** Дата начала в формате YYYY-MM-DD */
  from: string;
  /** Дата окончания в формате YYYY-MM-DD */
  to: string;
  /** Код точки для фильтрации (только для SelfOwner/NetManager) */
  point_code?: string;
  /** Телефон мастера для фильтрации (только для Manager и выше) */
  master_phone?: string;
}

/**
 * Информация о записи из API
 */
export interface CalendarBagsyInfo {
  id: string;
  client_phone: string;
  comment: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  created_at: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  end_at: string;
  master_phone: string;
  point_code: string;
  price: number;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  start_at: string;
  status: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  updated_at: string;
}

/**
 * Информация об услуге из API
 */
export interface CalendarServiceInfo {
  color: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  created_at: string;
  description: string;
  duration_minutes: number;
  id: string;
  name: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  updated_at: string;
}

/**
 * Элемент календаря из API
 */
export interface CalendarApiItem {
  bagsy_info: CalendarBagsyInfo;
  service_info: CalendarServiceInfo;
}

/**
 * Ответ API календаря
 */
export interface CalendarApiResponse {
  calendar: CalendarApiItem[];
}
