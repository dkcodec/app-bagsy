const API_BASE_URL = "/api/bff/";

export class ApiClient {
  private baseURL: string;
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private joinUrl(endpoint: string) {
    const base = this.baseURL.endsWith("/") ? this.baseURL : this.baseURL + "/";
    const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return base + path;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.joinUrl(endpoint);
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: ["GET", "HEAD"].includes((options.method || "GET").toUpperCase())
        ? undefined
        : options.body,
      cache: "no-store",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new ApiError(
        err.message || `HTTP ${response.status}`,
        response.status,
        err.code
      );
    }
    return response.json();
  }

  // с авто-рефрешем теперь занимается сам proxy; здесь можно без него
  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: "GET", ...(options || {}) });
  }
  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...(options || {}),
    });
  }
  put<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...(options || {}),
    });
  }
  patch<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...(options || {}),
    });
  }
  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: "DELETE", ...(options || {}) });
  }
}

/**
 * Унифицированная ошибка для всех API-запросов
 * Позволяет различать типы ошибок (auth, network, server и т.д.)
 */
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    status: number = 0,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /**
   * Проверяет, является ли ошибка ошибкой авторизации (401/403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Проверяет, является ли ошибка ошибкой сети (отсутствие соединения)
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Проверяет, является ли ошибка ошибкой сервера (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Проверяет, является ли ошибка клиентской (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}
