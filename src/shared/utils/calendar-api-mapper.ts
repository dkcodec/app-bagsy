import type {
  CalendarApiResponse,
  CalendarApiItem,
  IEvent,
  TEventColor,
} from "../types/calendar";
// В календарных событиях храним только masterPhone (мастер подтягивается отдельно)

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
 * Преобразует элемент календаря из API в IEvent
 */
function mapCalendarItemToEvent(item: CalendarApiItem): IEvent {
  const { bagsy_info, service_info } = item;

  return {
    id: parseInt(bagsy_info.id, 10) || 0,
    clientPhone: bagsy_info.client_phone,
    masterPhone: bagsy_info.master_phone,
    pointCode: bagsy_info.point_code,
    price: bagsy_info.price,
    createdAt: bagsy_info.created_at,
    updatedAt: bagsy_info.updated_at,
    status: bagsy_info.status,
    startDate: bagsy_info.start_at,
    endDate: bagsy_info.end_at,
    title: service_info.name,
    color: mapColorToEventColor(service_info.color),
    comment: bagsy_info.comment || "",
  };
}

/**
 * Преобразует ответ API календаря в массив событий IEvent[]
 */
export function mapCalendarApiResponseToEvents(
  response: CalendarApiResponse
): IEvent[] {
  return response.calendar.map(mapCalendarItemToEvent);
}
