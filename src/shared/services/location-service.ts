import { apiClient } from "../api";

/**
 * Категория локации (GET /api/v1/locations/categories)
 */
export interface ILocationCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

/**
 * Ответ API для получения списка категорий локаций
 */
export interface ILocationCategoriesResponse {
  categories: ILocationCategory[];
}

/**
 * Адрес локации (из swagger)
 */
export interface ILocationAddress {
  city: string;
  street: string;
  building: string;
  details?: string;
}

/**
 * Координаты локации
 */
export interface ILocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Полная информация о локации (GET /api/v1/locations, GET /api/v1/locations/{id})
 */
export interface ILocationDto {
  id: string;
  name: string;
  active: boolean;
  address: ILocationAddress;
  coordinates: ILocationCoordinates;
  category_id: string;
  description: string;
  phone: string;
  schedule_type: string;
  slot_duration_minutes: number;
  slug: string;
  created_at: string;
}

/**
 * Параметры запроса GET /api/v1/locations
 */
export interface GetLocationsParams {
  active?: boolean;
  limit?: number;
  offset?: number;
  order_by?: "created_at" | "name";
  sort_order?: "asc" | "desc";
}

/**
 * Ответ GET /api/v1/locations
 */
export interface GetLocationsResponse {
  locations: ILocationDto[];
  total: number;
}

/**
 * Данные для создания локации обслуживания (POST /api/v1/locations)
 */
export interface CreateLocationRequestDto {
  name: string;
  description?: string;
  phone: string;
  category_id: string;
  latitude: number;
  longitude: number;
  schedule_type: string;
  slot_duration_minutes: number;
  address: ILocationAddress;
}

/**
 * Ответ на создание локации
 */
export interface CreateLocationResponseDto {
  id: string;
  prompt_org_profile: boolean;
}

/**
 * Данные для обновления локации (PUT /api/v1/locations/{id})
 * Все поля опциональны
 */
export interface UpdateLocationRequestDto {
  name?: string;
  description?: string;
  phone?: string;
  category_id?: string;
  latitude?: number;
  longitude?: number;
  schedule_type?: string;
  slot_duration_minutes?: number;
  address?: Partial<ILocationAddress>;
}

/**
 * Сервис локаций (locations).
 */
export class LocationService {
  /**
   * Получение списка локаций организации (GET /api/v1/locations)
   */
  static async getLocations(
    params?: GetLocationsParams
  ): Promise<GetLocationsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.active !== undefined)
        searchParams.set("active", String(params.active));
      if (params.limit !== undefined)
        searchParams.set("limit", String(params.limit));
      if (params.offset !== undefined)
        searchParams.set("offset", String(params.offset));
      if (params.order_by) searchParams.set("order_by", params.order_by);
      if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    }
    const qs = searchParams.toString();
    return apiClient.get<GetLocationsResponse>(
      `api/v1/locations${qs ? `?${qs}` : ""}`
    );
  }

  /**
   * Получение информации о локации по ID (GET /api/v1/locations/{id})
   */
  static async getLocation(id: string): Promise<ILocationDto> {
    return apiClient.get<ILocationDto>(
      `api/v1/locations/${encodeURIComponent(id)}`
    );
  }

  /**
   * Получение списка категорий локаций (GET /api/v1/locations/categories)
   */
  static async getLocationCategories(): Promise<ILocationCategoriesResponse> {
    return apiClient.get<ILocationCategoriesResponse>(
      "api/v1/locations/categories"
    );
  }

  /**
   * Создание новой локации обслуживания (POST /api/v1/locations)
   */
  static async createLocation(
    data: CreateLocationRequestDto
  ): Promise<CreateLocationResponseDto> {
    return apiClient.post<CreateLocationResponseDto>("api/v1/locations", data);
  }

  /**
   * Обновление локации (PUT /api/v1/locations/{id})
   */
  static async updateLocation(
    id: string,
    data: UpdateLocationRequestDto
  ): Promise<ILocationDto> {
    return apiClient.put<ILocationDto>(
      `api/v1/locations/${encodeURIComponent(id)}`,
      data
    );
  }

  /**
   * Удаление локации (DELETE /api/v1/locations/{id})
   */
  static async deleteLocation(id: string): Promise<void> {
    await apiClient.delete(`api/v1/locations/${encodeURIComponent(id)}`);
  }
}
