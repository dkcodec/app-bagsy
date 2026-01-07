import { apiClient } from "@/src/shared/api";
import type { UpdateProfileRequest, IUserDto, UsersListResponseDto, UsersSearchRequest } from "@/src/shared/types/user";

/**
 * Сервис пользователя. Инкапсулирует эндпоинты и маппинг данных
 */
export class UserService {

  /**
   * Получение текущего пользователя
   */
  static async getMe(): Promise<IUserDto> {
    return apiClient.get<IUserDto>("v1/users/me")
  }

  static async getUserByPhone(phone: string): Promise<IUserDto> {
    return apiClient.get<IUserDto>(`v1/users/${phone}`);
  }

  /**
   * Обновление профиля пользователя
   */
  static async updateProfileByPhone(
    phone: string,
    data: UpdateProfileRequest
  ): Promise<IUserDto> {
    return apiClient.put<IUserDto>(`v1/users/${phone}`, data);
  }

  /**
   * Получение списка сотрудников с фильтрацией
   */
  static async getUsers(
    filters: UsersSearchRequest = {}
  ): Promise<UsersListResponseDto> {
    return apiClient.post<UsersListResponseDto>("v1/users", filters);
  }
}
