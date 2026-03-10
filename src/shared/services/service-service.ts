import { apiClient } from "../api";

/**
 * Категория услуги с дочерними подкатегориями (GET /api/v1/service-categories)
 * Дерево: categories → children (рекурсивно)
 */
export interface IServiceCategory {
  id: string;
  name: string;
  sort_order: number;
  children: IServiceCategory[];
}

/**
 * Ответ API для получения дерева категорий услуг
 */
export interface IServiceCategoriesResponse {
  categories: IServiceCategory[];
}

/**
 * Услуга локации обслуживания
 */
export interface IServiceDto {
  id: string;
  name: string;
  description: string;
  location_id: string;
  category_id: string;
  subcategory_id?: string;
  duration_minutes: number;
  color: string;
  active: boolean;
  min_price: number;
  max_price: number;
}

/**
 * Ответ API для получения списка услуг локации
 */
export interface ILocationServicesResponse {
  services: IServiceDto[];
}

/**
 * Данные для создания услуги
 */
export interface CreateServiceRequestDto {
  name: string;
  description: string;
  location_id: string;
  category_id: string;
  subcategory_id?: string;
  duration_minutes: number;
  color: string;
}

/**
 * Сервис услуг локации обслуживания.
 */
export class ServiceService {
  /**
   * Получение списка активных услуг для указанной локации
   */
  static async getLocationServices(
    locationId: string
  ): Promise<ILocationServicesResponse> {
    return apiClient.get<ILocationServicesResponse>(
      `api/v1/services/${encodeURIComponent(locationId)}`
    );
  }

  /**
   * Получение дерева категорий услуг по типу бизнеса (GET /api/v1/service-categories)
   * @param locationCategoryId — UUID категории локации
   */
  static async getServiceCategories(
    locationCategoryId: string
  ): Promise<IServiceCategoriesResponse> {
    return apiClient.get<IServiceCategoriesResponse>(
      "api/v1/service-categories",
      { query: { location_category_id: locationCategoryId } }
    );
  }

  /**
   * Создание новой услуги для локации обслуживания
   */
  static async createService(
    data: CreateServiceRequestDto
  ): Promise<IServiceDto> {
    return apiClient.post<IServiceDto>("api/v1/services", data);
  }
}
