import { apiClient } from "../client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  User,
} from "../types";

/**
 * Сервис для работы с авторизацией
 */
export const authService = {
  /**
   * Вход в систему
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "v1/auth/login",
      credentials
    );
    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    await apiClient.post("v1/auth/logout");
  },

  /**
   * Обновление токена
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post<RefreshResponse>("v1/auth/refresh");
    return response.data;
  },

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("v1/auth/me");
    return response.data;
  },
};
