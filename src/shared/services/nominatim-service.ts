/**
 * Адресные данные из Nominatim API
 */
export interface INominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  road?: string;
  house_number?: string;
  postcode?: string;
  country?: string;
  state?: string;
  region?: string;
}

/**
 * Результат поиска адреса в Nominatim
 */
export interface INominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: INominatimAddress;
  place_id: number;
  osm_type: string;
  osm_id: number;
}

/**
 * Ответ API Nominatim
 */
export type INominatimResponse = INominatimResult[];

/**
 * Сервис для работы с Nominatim API (OpenStreetMap)
 * Используется для поиска адресов и геокодирования
 */
export class NominatimService {
  /**
   * Базовый URL Nominatim API
   */
  private static readonly BASE_URL =
    "https://nominatim.openstreetmap.org/search";

  /**
   * User-Agent для запросов (требование Nominatim)
   */
  private static readonly USER_AGENT = "BagsyApp/1.0";

  /**
   * Поиск адресов по запросу
   * @param query - поисковый запрос (адрес, название места и т.д.)
   * @param limit - максимальное количество результатов (по умолчанию 5)
   * @returns Массив результатов поиска
   */
  static async searchAddress(
    query: string,
    limit: number = 5
  ): Promise<INominatimResponse> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const params = new URLSearchParams({
      q: query.trim(),
      format: "json",
      limit: limit.toString(),
      addressdetails: "1",
      // Ограничиваем поиск для лучшей производительности
      countrycodes: "kz", // Казахстан
    });

    try {
      const response = await fetch(`${this.BASE_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          "User-Agent": this.USER_AGENT,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Nominatim API error: ${response.status} ${response.statusText}`
        );
      }

      const data: INominatimResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Ошибка поиска адреса в Nominatim:", error);
      throw error;
    }
  }
}
