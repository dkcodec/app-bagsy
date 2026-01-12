import { apiClient } from "../api";
import { IStaffDto } from "../types/staff";
import { TUserRole } from "../types/user";

/**
 * Параметры запроса для получения списка сотрудников
 */
export interface GetStaffParams {
  point_code?: string;
  network_code?: string;
  role?: TUserRole[];
  phone?: string[];
  limit?: number;
  offset?: number;
  order_by?:
    | "phone"
    | "name"
    | "surname"
    | "point_code"
    | "network_code"
    | "created_at"
    | "updated_at";
  sort_order?: "asc" | "desc";
}

/**
 * Сервис сотрудников. Инкапсулирует эндпоинты и маппинг данных
 */
export class StaffService {
  /**
   * Получение списка сотрудников с фильтрацией, сортировкой и пагинацией
   */
  static async getStaff(params?: GetStaffParams): Promise<IStaffDto> {
    return apiClient.get<IStaffDto>("v1/staff", {
      query: {
        ...(params?.point_code && { point_code: params.point_code }),
        ...(params?.network_code && { network_code: params.network_code }),
        ...(params?.role && params.role.length > 0 && { role: params.role }),
        ...(params?.phone &&
          params.phone.length > 0 && { phone: params.phone }),
        ...(params?.limit && { limit: params.limit }),
        ...(params?.offset !== undefined && { offset: params.offset }),
        ...(params?.order_by && { order_by: params.order_by }),
        ...(params?.sort_order && { sort_order: params.sort_order }),
      },
    });
  }
}
