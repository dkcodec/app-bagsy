/**
 * Сервис аналитики.
 *
 * Контракт см. в docs/ANALYTICS_API_SPEC.md.
 * Все эндпоинты принимают одинаковые query-параметры (from, to, location_id?).
 * Период сравнения (prev/delta) бэк вычисляет САМ по правилам пресета.
 */

import { apiClient } from "../api";
import type {
  AnalyticsParams,
  IClientsAnalyticsDto,
  IEmployeeAnalyticsDto,
  IFinanceReportDto,
  IMyAnalyticsDto,
  IOverviewDto,
  IStaffReportDto,
} from "../types/analytics";

/**
 * Подготовка query-объекта: отдаём только заданные ключи, чтобы не было
 * `location_id=undefined` в URL. "all" не передаём — бэк трактует отсутствие
 * параметра как "все локации".
 */
function buildQuery(params: AnalyticsParams) {
  return {
    from: params.from,
    to: params.to,
    ...(params.location_id && params.location_id !== "all"
      ? { location_id: params.location_id }
      : {}),
  };
}

export class AnalyticsService {
  /** GET /api/v1/analytics/overview — сводка для главной (Manager/Owner). */
  static getOverview(params: AnalyticsParams): Promise<IOverviewDto> {
    return apiClient.get<IOverviewDto>("api/v1/analytics/overview", {
      query: buildQuery(params),
    });
  }

  /**
   * GET /api/v1/analytics/me — личная аналитика.
   * Текущий сотрудник определяется бэком по токену.
   */
  static getMyAnalytics(params: AnalyticsParams): Promise<IMyAnalyticsDto> {
    return apiClient.get<IMyAnalyticsDto>("api/v1/analytics/me", {
      query: { from: params.from, to: params.to },
    });
  }

  /** GET /api/v1/analytics/staff — таблица мастеров. */
  static getStaffReport(params: AnalyticsParams): Promise<IStaffReportDto> {
    return apiClient.get<IStaffReportDto>("api/v1/analytics/staff", {
      query: buildQuery(params),
    });
  }

  /** GET /api/v1/analytics/staff/{employee_id} — drill-down по мастеру. */
  static getEmployeeAnalytics(
    employeeId: string,
    params: AnalyticsParams
  ): Promise<IEmployeeAnalyticsDto> {
    return apiClient.get<IEmployeeAnalyticsDto>(
      `api/v1/analytics/staff/${employeeId}`,
      { query: { from: params.from, to: params.to } }
    );
  }

  /** GET /api/v1/analytics/locations/{location_id} — drill-down по локации (Network Owner). */
  static getLocationAnalytics(
    locationId: string,
    params: AnalyticsParams
  ): Promise<IOverviewDto> {
    return apiClient.get<IOverviewDto>(
      `api/v1/analytics/locations/${locationId}`,
      { query: { from: params.from, to: params.to } }
    );
  }

  /** GET /api/v1/analytics/finance — финансовый отчёт. */
  static getFinanceReport(params: AnalyticsParams): Promise<IFinanceReportDto> {
    return apiClient.get<IFinanceReportDto>("api/v1/analytics/finance", {
      query: buildQuery(params),
    });
  }

  /** GET /api/v1/analytics/clients — клиенты (Beta). */
  static getClientsAnalytics(
    params: AnalyticsParams
  ): Promise<IClientsAnalyticsDto> {
    return apiClient.get<IClientsAnalyticsDto>("api/v1/analytics/clients", {
      query: buildQuery(params),
    });
  }
}
