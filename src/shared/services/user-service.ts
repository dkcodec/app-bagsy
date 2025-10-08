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

/**
 * Сервис пользователя. Инкапсулирует эндпоинты и маппинг данных
 */
export class UserService {
  static async getUserByPhone(phone: string): Promise<UserResponseDto> {
    return apiClient.get<UserResponseDto>(`v1/users/${phone}`);
  }
}
