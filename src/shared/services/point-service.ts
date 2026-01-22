import { apiClient } from "../api";
import type { ISchedule } from "../types/user";

/**
 * Адрес точки обслуживания
 */
export interface IPointAddress {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  street: string;
  city: string;
}

/**
 * Полная информация о точке обслуживания
 */
export interface IPointDto {
  code: string;
  name: string;
  network_code: string;
  category_id: number;
  address: IPointAddress;
  city: string;
  active: boolean;
  schedule: ISchedule[];
  created_at: string;
  updated_at: string;
}

/**
 * Ответ API для получения списка точек сети
 */
export interface INetworkPointsResponse {
  points: IPointDto[];
  count: number;
}

/**
 * Сервис точки обслуживания.
 */
export class PointService {
  /**
   * Получение информации о точке по коду
   */
  static async getPoint(code: string): Promise<IPointDto> {
    return apiClient.get<IPointDto>(`v1/points/${encodeURIComponent(code)}`);
  }

  /**
   * Получение списка всех точек сети
   */
  static async getNetworkPoints(
    networkCode: string
  ): Promise<INetworkPointsResponse> {
    return apiClient.get<INetworkPointsResponse>(
      `v1/networks/${encodeURIComponent(networkCode)}/points`
    );
  }
}
