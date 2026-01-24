import { apiClient } from "../api";

/**
 * Подкатегория услуги
 */
export interface IServiceSubcategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Категория услуги с подкатегориями
 */
export interface IServiceCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  subcategories: IServiceSubcategory[];
}

/**
 * Ответ API для получения списка категорий услуг
 */
export interface IServiceCategoriesResponse {
  categories: IServiceCategory[];
  count: number;
}

/**
 * Услуга точки обслуживания
 */
export interface IServiceDto {
  id: string;
  name: string;
  description: string;
  point_code: string;
  category_id: number;
  subcategory_id: number;
  duration_minutes: number;
  color: string;
  active: boolean;
  min_price: number;
  max_price: number;
}

/**
 * Ответ API для получения списка услуг точки
 */
export interface IPointServicesResponse {
  services: IServiceDto[];
}

/**
 * Данные для создания услуги
 */
export interface CreateServiceRequestDto {
  name: string;
  description: string;
  point_code: string;
  category_id: number;
  subcategory_id: number;
  duration_minutes: number;
  color: string;
}

/**
 * Сервис услуг точки обслуживания.
 */
export class ServiceService {
  /**
   * Получение списка активных услуг для указанной точки
   */
  static async getPointServices(
    pointCode: string
  ): Promise<IPointServicesResponse> {
    return apiClient.get<IPointServicesResponse>(
      `v1/services/${encodeURIComponent(pointCode)}`
    );
  }

  /**
   * Получение списка категорий услуг и их подкатегорий для указанной точки
   */
  static async getServiceCategories(
    pointCode: string
  ): Promise<IServiceCategoriesResponse> {
    return apiClient.get<IServiceCategoriesResponse>(
      `v1/service-categories/${encodeURIComponent(pointCode)}`
    );
  }

  /**
   * Создание новой услуги для точки обслуживания
   */
  static async createService(
    data: CreateServiceRequestDto
  ): Promise<IServiceDto> {
    return apiClient.post<IServiceDto>("v1/services", data);
  }
}
