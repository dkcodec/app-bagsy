import { apiClient } from "../api";

export interface UserDto {
  created_at: string;
  is_active: boolean;
  name: string;
  phone: string;
  point_code: string;
  role: string;
  surname: string;
  updated_at: string;
  updated_by: string;
}

export interface UserResponseDto {
  data: UserDto;
  message: string;
  code?: number;
}

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  password?: string;
}

/**
 * Сервис пользователя. Инкапсулирует эндпоинты и маппинг данных
 */
export class UserService {
  static async getUserByPhone(phone: string): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(`v1/users/${phone}`);
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfileByPhone(
    phone: string,
    data: UpdateProfileRequest
  ): Promise<UserDto> {
    return apiClient.put<UserDto>(`v1/users/${phone}`, data);
  }
}
