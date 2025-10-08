/**
 * Легкий HTTP клиент поверх fetch с обработкой JSON и ошибок
 * Спроектирован для расширения (интерсепторы, токены, ретраи)
 */

import {
  getAccessToken,
  setAuthTokens,
  clearAuthTokens,
} from "../utils/cookies";
import { AuthService } from "../services/auth-service";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpClientOptions {
  baseUrl?: string;
  getAuthToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
}

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly getAuthToken?: () => string | null | undefined;
  private readonly onUnauthorized?: () => void;
  private isRefreshing = false; // Флаг для предотвращения множественных refresh
  private refreshPromise: Promise<void> | null = null; // Промис для синхронизации refresh

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, "") || "";
    this.getAuthToken = options.getAuthToken;
    this.onUnauthorized = options.onUnauthorized;
  }

  async request<T>(
    path: string,
    method: HttpMethod,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.executeRequest<T>(path, method, options);
  }

  /**
   * Выполняет запрос с автоматическим refresh токена при 401 ошибке
   */
  private async executeRequest<T>(
    path: string,
    method: HttpMethod,
    options: RequestOptions = {},
    isRetry = false
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const headers = new Headers({
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    });

    // Получаем токен (приоритет: переданный колбэк, затем из cookies)
    const token = this.getAuthToken?.() || (await getAccessToken());
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      method,
      headers,
      body: options.body,
      cache: options.cache ?? "no-store",
    });

    // Если получили 401 и это не повторный запрос - пытаемся refresh токен
    if (!response.ok && response.status === 401 && !isRetry) {
      try {
        await this.refreshTokenIfNeeded();
        // Повторяем запрос с новым токеном
        return this.executeRequest<T>(path, method, options, true);
      } catch (refreshError) {
        // Если refresh не удался - очищаем токены и вызываем колбэк
        await clearAuthTokens();
        this.onUnauthorized?.();
        throw refreshError;
      }
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        this.onUnauthorized?.();
      }
      let errorBody: unknown = undefined;
      try {
        errorBody = await response.json();
      } catch {
        // ignore json parse error
      }
      const error = new Error(
        (errorBody as { message?: string })?.message ||
          response.statusText ||
          "Request failed"
      ) as Error & { status: number; body: unknown };
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    if (response.status === 204) return undefined as unknown as T;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    // Fallback: text
    return (await response.text()) as unknown as T;
  }

  /**
   * Обновляет токен если нужно (с защитой от множественных вызовов)
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    // Если уже идет refresh - ждем его завершения
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Если не идет refresh - запускаем новый
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshPromise = this.performTokenRefresh();
    }

    return this.refreshPromise!;
  }

  /**
   * Выполняет обновление токена
   */
  private async performTokenRefresh(): Promise<void> {
    try {
      const response = await AuthService.refreshToken();
      await setAuthTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, "GET", options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    const normalizedBody =
      typeof body === "string"
        ? body
        : body != null
          ? JSON.stringify(body)
          : undefined;
    return this.request<T>(path, "POST", {
      ...(options || {}),
      body: normalizedBody as BodyInit | null | undefined,
    });
  }
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    const normalizedBody =
      typeof body === "string"
        ? body
        : body != null
          ? JSON.stringify(body)
          : undefined;
    return this.request<T>(path, "PUT", {
      ...(options || {}),
      body: normalizedBody as BodyInit | null | undefined,
    });
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    const normalizedBody =
      typeof body === "string"
        ? body
        : body != null
          ? JSON.stringify(body)
          : undefined;
    return this.request<T>(path, "PATCH", {
      ...(options || {}),
      body: normalizedBody as BodyInit | null | undefined,
    });
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, "DELETE", options);
  }

  private buildUrl(path: string, query?: RequestOptions["query"]) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(
      this.baseUrl + cleanPath,
      typeof window === "undefined"
        ? "http://localhost"
        : window.location.origin
    );
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, String(value));
      });
    }
    return this.baseUrl ? url.toString() : url.pathname + url.search;
  }
}

// Единый экземпляр клиента приложения с автоматическим refresh токена
export const apiClient = new HttpClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getAuthToken: () => {
    // Синхронное получение токена для совместимости
    if (typeof window === "undefined") return null;
    return document.cookie
      .split("; ")
      .find(row => row.startsWith("access_token="))
      ?.split("=")[1];
  },
  onUnauthorized: () => {
    // Перенаправляем на страницу логина при ошибке авторизации
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});
