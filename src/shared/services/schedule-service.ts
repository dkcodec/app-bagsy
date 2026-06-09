import { apiClient } from "../api";
import type {
  ScheduleSlotsResponse,
  SaveScheduleSlotsRequest,
} from "../types/schedule";

/**
 * Сервис расписания сотрудников и локаций.
 * Эндпоинты: /api/v1/employee-schedules, /api/v1/location-schedules.
 */
export class ScheduleService {
  // ——— Employee schedules ———

  /** GET /api/v1/employee-schedules/{employeeID}?start=&end= */
  static async getEmployeeSchedule(
    employeeId: string,
    start: string,
    end: string
  ): Promise<ScheduleSlotsResponse> {
    return apiClient.get<ScheduleSlotsResponse>(
      `api/v1/employee-schedules/${encodeURIComponent(employeeId)}`,
      { query: { start, end } }
    );
  }

  /** PUT /api/v1/employee-schedules/{employeeID} */
  static async saveEmployeeSchedule(
    employeeId: string,
    data: SaveScheduleSlotsRequest
  ): Promise<void> {
    await apiClient.put(
      `api/v1/employee-schedules/${encodeURIComponent(employeeId)}`,
      data
    );
  }

  /** DELETE /api/v1/employee-schedules/{employeeID}?start=&end= */
  static async deleteEmployeeSchedule(
    employeeId: string,
    start: string,
    end: string
  ): Promise<void> {
    await apiClient.delete(
      `api/v1/employee-schedules/${encodeURIComponent(employeeId)}`,
      { query: { start, end } }
    );
  }

  // ——— Location schedules ———

  /** GET /api/v1/location-schedules/{locationID}?start=&end= */
  static async getLocationSchedule(
    locationId: string,
    start: string,
    end: string
  ): Promise<ScheduleSlotsResponse> {
    return apiClient.get<ScheduleSlotsResponse>(
      `api/v1/location-schedules/${encodeURIComponent(locationId)}`,
      { query: { start, end } }
    );
  }

  /** PUT /api/v1/location-schedules/{locationID} */
  static async saveLocationSchedule(
    locationId: string,
    data: SaveScheduleSlotsRequest
  ): Promise<void> {
    await apiClient.put(
      `api/v1/location-schedules/${encodeURIComponent(locationId)}`,
      data
    );
  }

  /** DELETE /api/v1/location-schedules/{locationID}?start=&end= */
  static async deleteLocationSchedule(
    locationId: string,
    start: string,
    end: string
  ): Promise<void> {
    await apiClient.delete(
      `api/v1/location-schedules/${encodeURIComponent(locationId)}`,
      { query: { start, end } }
    );
  }
}
