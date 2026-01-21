import { apiClient } from "../api";
import type { ISchedule } from "../types/user";

export interface IPointDto {
  code: string;
  schedule: ISchedule[];
}

/**
 * Сервис точки обслуживания.
 */
export class PointService {
  static async getPoint(code: string): Promise<IPointDto> {
    return apiClient.get<IPointDto>(`v1/points/${encodeURIComponent(code)}`);
  }
}
