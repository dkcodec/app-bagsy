import { apiClient } from "../api";
import type { ISchedule } from "../types/user";

/**
 * Категория точки обслуживания
 */
export interface IPointCategory {
  id: number;
  name: string;
  description: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  created_at: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  updated_at: string;
}

/**
 * Ответ API для получения списка категорий точек
 */
export interface IPointCategoriesResponse {
  categories: IPointCategory[];
  count: number;
}

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
 * Данные для создания точки обслуживания
 */
export interface CreatePointRequestDto {
  name: string;
  description?: string;
  network_code: string;
  category_id: number;
  address: IPointAddress;
  schedule: ISchedule[];
  photo_ids?: string[];
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
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  created_at: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
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

  /**
   * Получение списка категорий точек
   */
  static async getPointCategories(): Promise<IPointCategoriesResponse> {
    return apiClient.get<IPointCategoriesResponse>("v1/point-categories");
  }

  /**
   * Создание новой точки обслуживания
   */
  static async createPoint(data: CreatePointRequestDto): Promise<IPointDto> {
    return apiClient.post<IPointDto>("v1/points", data);
  }
}
