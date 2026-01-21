import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  addDays,
} from "date-fns";
import type { TCalendarView } from "../types/calendar";

/**
 * Вычисляет диапазон дат для запроса календаря на основе вида и выбранной даты
 * Возвращает объект с from и to в формате YYYY-MM-DD
 */
export function getCalendarDateRange(
  view: TCalendarView,
  selectedDate: Date
): { from: string; to: string } {
  let fromDate: Date;
  let toDate: Date;

  switch (view) {
    case "day":
      // Один день
      fromDate = startOfDay(selectedDate);
      toDate = endOfDay(addDays(selectedDate, 1));
      break;

    case "week":
      // Неделя (7 дней)
      fromDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      toDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      break;

    case "month":
    case "agenda":
      // Месяц (до 31 дня, но ограничено 35 днями максимум)
      fromDate = startOfMonth(selectedDate);
      toDate = endOfMonth(selectedDate);
      break;

    default:
      // По умолчанию - неделя
      fromDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      toDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
  }

  return {
    from: format(fromDate, "yyyy-MM-dd"),
    to: format(toDate, "yyyy-MM-dd"),
  };
}
