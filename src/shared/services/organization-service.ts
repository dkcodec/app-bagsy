import { apiClient } from "../api";

/** Запрос обновления профиля организации (PUT /api/v1/organizations/me) */
export interface UpdateOrganizationRequest {
  name: string;
  description?: string;
}

/** Ответ обновления профиля организации */
export interface UpdateOrganizationResponse {
  id: string;
  name: string;
  description: string;
}

/**
 * Сервис организации.
 */
export class OrganizationService {
  /**
   * Обновление профиля организации (PUT /api/v1/organizations/me)
   * Используется при создании сети — владелец задаёт название и описание
   */
  static async updateOrganization(
    data: UpdateOrganizationRequest
  ): Promise<UpdateOrganizationResponse> {
    return apiClient.put<UpdateOrganizationResponse>(
      "api/v1/organizations/me",
      data
    );
  }
}
