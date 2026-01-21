import { differenceInDays, parseISO } from "date-fns";
import { apiClient } from "../api";
import type { GetCalendarParams, CalendarApiResponse } from "../types/calendar";

/**
 * Максимальный промежуток между временными рамками (дни)
 */
const MAX_DATE_RANGE_DAYS = 35;

/**
 * Сервис календаря. Инкапсулирует эндпоинты и валидацию данных
 */
export class CalendarService {
  /**
   * Получение записей календаря за указанный период
   * Валидирует максимальный промежуток в 35 дней
   */
  static async getCalendar(
    params: GetCalendarParams
  ): Promise<CalendarApiResponse> {
    // Валидация диапазона дат
    const fromDate = parseISO(params.from);
    const toDate = parseISO(params.to);
    const daysDiff = differenceInDays(toDate, fromDate);

    if (daysDiff < 0) {
      throw new Error("Дата начала не может быть позже даты окончания");
    }

    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      throw new Error(
        `Максимальный промежуток между датами - ${MAX_DATE_RANGE_DAYS} дней`
      );
    }

    // Построение query параметров с учетом опциональных полей
    const queryParams: Record<string, string> = {
      from: params.from,
      to: params.to,
    };

    if (params.point_code) {
      queryParams.point_code = params.point_code;
    }

    if (params.master_phone) {
      queryParams.master_phone = params.master_phone;
    }

    return apiClient.get<CalendarApiResponse>("v1/calendar", {
      query: queryParams,
    });
  }
}
