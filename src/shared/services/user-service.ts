import { apiClient } from "@/src/shared/api";
import type {
  UpdateProfileRequest,
  UpdateScheduleRequest,
  IUserDto
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

  /**
   * Удаление аватара (soft delete user_media, деактивация media)
   */
  static async deleteAvatar(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>("v1/users/me/avatar");
  }

  /**
   * Обновление расписания текущего пользователя. PUT v1/users/me/schedule
   */
  static async updateSchedule(
    data: UpdateScheduleRequest
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>("v1/users/me/schedule", data);
  }
}
