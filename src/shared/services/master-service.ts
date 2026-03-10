import { apiClient } from "../api";

/**
 * Тело запроса POST /api/v1/employee-services
 * Привязка сотрудника к услуге с индивидуальной ценой
 */
export interface CreateEmployeeServiceRequest {
  /** UUID сотрудника */
  employee_id: string;
  /** Цена услуги (строка, в тенге) */
  price: string;
  /** UUID услуги */
  service_id: string;
}

/** @deprecated Используй CreateEmployeeServiceRequest */
export type CreateMasterServiceRequestDto = CreateEmployeeServiceRequest;

/**
 * Ответ API при создании связи сотрудник-услуга
 */
export interface CreateEmployeeServiceResponse {
  /** UUID созданной связи */
  id: string;
}

/** @deprecated Используй CreateEmployeeServiceResponse */
export type CreateMasterServiceResponseDto = CreateEmployeeServiceResponse;

/**
 * Сервис для работы со связями сотрудник-услуга
 */
export class MasterService {
  /**
   * Привязка сотрудника к услуге с индивидуальной ценой
   * POST /api/v1/employee-services
   */
  static async createMasterService(
    data: CreateEmployeeServiceRequest
  ): Promise<CreateEmployeeServiceResponse> {
    return apiClient.post<CreateEmployeeServiceResponse>(
      "api/v1/employee-services",
      data
    );
  }
}
