/**
 * API клиент для работы с бэкендом
 * Настроен для работы с httpOnly cookies и обработки ошибок
 */

import { ApiResponse } from "./types";

// Базовый URL API (можно вынести в переменные окружения)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Класс для работы с API
 * Обрабатывает запросы, ошибки и автоматически добавляет cookies
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Базовый метод для выполнения HTTP запросов
   * Автоматически обрабатывает ошибки и добавляет необходимые заголовки
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Настройки по умолчанию
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // Включаем cookies для автоматической отправки httpOnly cookies
      // credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      // Проверяем статус ответа
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      // Парсим JSON ответ
      const data = await response.json();
      return data;
    } catch (error) {
      // Обрабатываем различные типы ошибок
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError(
          "Ошибка сети. Проверьте подключение к интернету.",
          0
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Неизвестная ошибка",
        0
      );
    }
  }

  /**
   * GET запрос
   */
  async get<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  /**
   * POST запрос
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT запрос
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PATCH запрос
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE запрос
   */
  async delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

// Создаем экземпляр API клиента
export const apiClient = new ApiClient();

// Экспортируем класс для создания специализированных клиентов
export { ApiClient };

// Класс для обработки ошибок API
export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /**
   * Проверяет, является ли ошибка ошибкой авторизации
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Проверяет, является ли ошибка ошибкой сети
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Проверяет, является ли ошибка ошибкой сервера
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}
