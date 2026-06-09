import type {
  CalendarApiResponse,
  CalendarEntryResponse,
  IEvent,
  TEventColor,
} from "../types/calendar";

/**
 * Маппинг цвета из API в TEventColor
 * Если цвет не соответствует допустимым значениям, используется "gray" по умолчанию
 */
function mapColorToEventColor(color: string): TEventColor {
  const validColors: TEventColor[] = [
    "blue",
    "green",
    "red",
    "yellow",
    "purple",
    "orange",
    "gray",
  ];

  return validColors.includes(color as TEventColor)
    ? (color as TEventColor)
    : "gray";
}

/**
 * Преобразует элемент календаря из нового API (плоский формат) в IEvent
 */
function mapCalendarEntryToEvent(entry: CalendarEntryResponse): IEvent {
  return {
    id: entry.appointment_id,
    customerPhone: entry.customer_phone,
    customerName: entry.customer_name,
    customerId: entry.customer_id,
    employeeId: entry.employee_id,
    employeeName: entry.employee_name,
    locationId: entry.location_id,
    locationName: entry.location_name,
    startDate: entry.start_at,
    endDate: entry.end_at,
    durationMinutes: entry.duration_minutes,
    title: entry.service_name,
    serviceId: entry.service_id,
    price: entry.price,
    status: entry.status,
    color: mapColorToEventColor(entry.service_color),
    comment: entry.customer_comment || "",
    // Deprecated поля для обратной совместимости
    clientPhone: entry.customer_phone,
    masterPhone: entry.employee_id,
  };
}

/**
 * Преобразует ответ API календаря в массив событий IEvent[]
 */
export function mapCalendarApiResponseToEvents(
  response: CalendarApiResponse
): IEvent[] {
  return response.calendar.map(mapCalendarEntryToEvent);
}
