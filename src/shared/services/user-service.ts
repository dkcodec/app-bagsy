import { apiClient } from "@/src/shared/api";
import type {
  UpdateProfileRequest,
  IUserDto,
  UsersListResponseDto,
  UsersSearchRequest,
} from "@/src/shared/types/user";

/**
 * Сервис пользователя. Инкапсулирует эндпоинты и маппинг данных
 */
export class UserService {
  /**
   * Получение текущего пользователя
   */
  static async getMe(): Promise<IUserDto> {
    return apiClient.get<IUserDto>("v1/users/me");
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateMe(data: UpdateProfileRequest): Promise<IUserDto> {
    return apiClient.put<IUserDto>("v1/users/me", data);
  }

  static async getUserByPhone(phone: string): Promise<IUserDto> {
    return apiClient.get<IUserDto>(`v1/users/${phone}`);
  }
}
