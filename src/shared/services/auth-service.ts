import { apiClient } from "../api";
import {
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
} from "../utils/cookies";

export interface LoginRequestDto {
  phone: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  message?: string;
  code?: number;
}

export interface RegisterRequestDto {
  phone: string;
  password: string;
  token: string;
  name: string;
  surname: string;
}

export interface RegisterResponseDto {
  access_token: string;
  refresh_token: string;
  message?: string;
  code?: number;
}

/**
 * Сервис авторизации. Инкапсулирует эндпоинты и маппинг данных
 */
export class AuthService {
  /**
   * Авторизация пользователя
   */
  static async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient.post<LoginResponseDto>("v1/auth/login", payload);
  }

  /**
   * Регистрация пароля пользователя
   */
  static async registerConfirm(
    payload: RegisterRequestDto
  ): Promise<RegisterResponseDto> {
    return apiClient.post<RegisterResponseDto>(
      "v1/auth/staff/register/confirm",
      payload
    );
  }

  /**
   * Обновление токена доступа
   */
  static async refreshToken(): Promise<LoginResponseDto> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    return apiClient.post<LoginResponseDto>(
      "v1/auth/refresh",
      {},
      {
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      }
    );
  }

  /**
   * Выход из системы
   */
  static async logout(): Promise<void> {
    await clearAuthTokens();
  }

  /**
   * Проверка авторизации
   */
  static async isAuthenticated(): Promise<boolean> {
    const accessToken = await getAccessToken();
    return Boolean(accessToken);
  }
}
