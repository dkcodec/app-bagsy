import { apiClient } from "../api";
import {
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
} from "../utils/cookies";

/** Назначение action-токена (инвайт или сброс пароля) */
export type VerifyAuthTokenPurpose = "password_reset" | "staff_invitation";

export interface LoginRequestDto {
  phone: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
}

/** Ответ на проверку action-токена */
export interface VerifyAuthTokenResponseDto {
  phone: string;
  purpose: VerifyAuthTokenPurpose;
  organization_id: string;
  location_id: string;
}

/** Запрос сброса пароля (шаг 1) */
export interface PasswordResetRequestDto {
  phone: string;
}

export interface PasswordResetResponseDto {
  message: string;
}

/** Подтверждение сброса пароля (шаг 2) */
export interface PasswordResetConfirmRequestDto {
  token: string;
  new_password: string;
}

export interface PasswordResetConfirmResponseDto {
  access_token: string;
  refresh_token: string;
}

/**
 * Сервис авторизации. Инкапсулирует эндпоинты и маппинг данных.
 * Эндпоинты регистрации (register, register/verify, register/resend)
 * используются на лендинге bagsy.kz, НЕ в ЛК.
 */
export class AuthService {
  /**
   * Авторизация пользователя
   */
  static async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    return apiClient.post<LoginResponseDto>("api/v1/auth/login", payload);
  }

  /**
   * Обновление токена доступа
   */
  static async refreshToken(): Promise<LoginResponseDto> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    return apiClient.post<LoginResponseDto>("api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
  }

  /**
   * Проверка валидности action-токена (для инвайта или сброса пароля)
   */
  static async verifyAuthToken(
    token: string
  ): Promise<VerifyAuthTokenResponseDto> {
    return apiClient.get<VerifyAuthTokenResponseDto>(
      `api/v1/auth/verify/${token}`
    );
  }

  /**
   * Запрос на сброс пароля (отправляет ссылку)
   */
  static async passwordReset(
    payload: PasswordResetRequestDto
  ): Promise<PasswordResetResponseDto> {
    return apiClient.post<PasswordResetResponseDto>(
      "api/v1/auth/password/reset",
      payload
    );
  }

  /**
   * Подтверждение сброса пароля (устанавливает новый пароль)
   */
  static async passwordResetConfirm(
    payload: PasswordResetConfirmRequestDto
  ): Promise<PasswordResetConfirmResponseDto> {
    return apiClient.post<PasswordResetConfirmResponseDto>(
      "api/v1/auth/password/reset/confirm",
      payload
    );
  }

  /**
   * Выход из системы — инвалидация refresh токена на бэке + очистка кук
   */
  static async logout(): Promise<void> {
    const refreshToken = await getRefreshToken();
    // Отправляем logout на бэк, если есть refresh token
    if (refreshToken) {
      try {
        await apiClient.post("api/v1/auth/logout", {
          refresh_token: refreshToken,
        });
      } catch {
        // Даже если logout на бэке упал, очищаем куки локально
      }
    }
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
