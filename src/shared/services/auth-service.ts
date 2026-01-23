import { apiClient } from "../api";
import {
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
} from "../utils/cookies";

export type VerifyAuthTokenPurpose = "register" | "password_change";

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
}

export interface RegisterResponseDto {
  access_token: string;
  refresh_token: string;
  message?: string;
  code?: number;
}

export interface VerifyAuthTokenResponseDto {
  network_code: string;
  phone: string;
  point_code: string;
  purpose: VerifyAuthTokenPurpose;
}

export interface PasswordChangeRequestDto {
  password: string;
  token: string;
}

export interface PasswordChangeResponseDto {
  message?: string;
  code?: number;
}
export interface PasswordChangeRequestRequestDto {
  phone: string;
}

export interface PasswordChangeRequestResponseDto {
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
   * Проверка валидности токена авторизации
   */
  static async verifyAuthToken(
    token: string
  ): Promise<VerifyAuthTokenResponseDto> {
    return apiClient.get<VerifyAuthTokenResponseDto>(
      `v1/auth/verify-auth-token/${token}`
    );
  }

  /**
   * Изменение пароля пользователя
   */
  static async passwordChange(
    payload: PasswordChangeRequestDto
  ): Promise<PasswordChangeResponseDto> {
    return apiClient.post<PasswordChangeResponseDto>(
      "v1/auth/password/change/confirm",
      payload
    );
  }

  /**
   * Запрос на изменение пароля
   */
  static async passwordChangeRequest(
    payload: PasswordChangeRequestRequestDto
  ): Promise<PasswordChangeRequestResponseDto> {
    return apiClient.post<PasswordChangeRequestResponseDto>(
      "v1/auth/password/change",
      payload
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
