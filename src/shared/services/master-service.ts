import { apiClient } from "../api";

/**
 * Тело запроса для создания связи мастер-услуга
 */
export interface CreateMasterServiceRequestDto {
  /** Номер телефона мастера. Опционален для STAFF и SELF_OWNER */
  master_phone?: string;
  /** Цена услуги для мастера (в тенге) */
  price: number;
  /** ID услуги */
  service_id: string;
}

/**
 * Ответ API при создании связи мастер-услуга
 */
export interface CreateMasterServiceResponseDto {
  /** ID созданной связи */
  id: string;
}

/**
 * Сервис для работы со связями мастер-услуга
 * Инкапсулирует эндпоинты и маппинг данных
 */
export class MasterService {
  /**
   * Создание связи между мастером и услугой с указанной ценой
   * @param data Данные для создания связи
   * @returns ID созданной связи
   */
  static async createMasterService(
    data: CreateMasterServiceRequestDto
  ): Promise<CreateMasterServiceResponseDto> {
    return apiClient.post<CreateMasterServiceResponseDto>(
      "v1/master-services",
      data
    );
  }
}
