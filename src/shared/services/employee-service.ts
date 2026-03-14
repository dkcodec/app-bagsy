import { apiClient } from "../api";
import type {
  IEmployeeDto,
  IEmployeePermissions,
  TUserRole,
  UpdateEmployeeProfileRequest,
} from "../types/user";
import type { IEmployeesResponse } from "../types/staff";

// ============================================================
// Invite types
// ============================================================

/** Запрос на приглашение сотрудника (POST /api/v1/employees/invite) */
export interface InviteEmployeeRequest {
  phone: string;
  first_name: string;
  last_name: string;
  role: "owner" | "manager" | "staff";
  location_id: string;
}

export interface InviteEmployeeResponse {
  message: string;
  phone: string;
  expires_in: number;
}

/** Подтверждение приглашения (POST /api/v1/employees/invite/confirm) */
export interface ConfirmInviteRequest {
  token: string;
  password: string;
}

export interface ConfirmInviteResponse {
  access_token: string;
  refresh_token: string;
}

/** Повторная отправка приглашения (POST /api/v1/employees/invite/resend) */
export interface ResendInviteRequest {
  phone: string;
}

export interface ResendInviteResponse {
  message: string;
  phone: string;
  expires_in: number;
  retry_after: number;
}

// ============================================================
// List params
// ============================================================

/** Параметры запроса GET /api/v1/employees */
export interface GetEmployeesParams {
  location_id?: string;
  role?: TUserRole[];
  search?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
  order_by?: "created_at" | "first_name" | "phone" | "role";
  sort_order?: "asc" | "desc";
}

// ============================================================
// Service
// ============================================================

/** Нормализация телефона: убираем + и оставляем только цифры */
function normalizePhone(phone: string): string {
  return phone.replace(/^\+/, "").match(/\d/g)?.join("") || "";
}

/**
 * Сервис сотрудников. Инкапсулирует все эндпоинты /api/v1/employees/*.
 */
export class EmployeeService {
  // ——— Me ———

  /** Получение текущего сотрудника (GET /api/v1/employees/me) */
  static async getMe(): Promise<IEmployeeDto> {
    return apiClient.get<IEmployeeDto>("api/v1/employees/me");
  }

  /** Обновление профиля (PUT /api/v1/employees/me) */
  static async updateMe(
    data: UpdateEmployeeProfileRequest
  ): Promise<IEmployeeDto> {
    return apiClient.put<IEmployeeDto>("api/v1/employees/me", data);
  }

  // ——— List ———

  /** Список сотрудников с фильтрацией и пагинацией (GET /api/v1/employees) */
  static async getEmployees(
    params?: GetEmployeesParams
  ): Promise<IEmployeesResponse> {
    return apiClient.get<IEmployeesResponse>("api/v1/employees", {
      query: {
        ...(params?.location_id && { location_id: params.location_id }),
        ...(params?.role && params.role.length > 0 && { role: params.role }),
        ...(params?.search?.trim() && {
          search: params.search,
        }),
        ...(params?.active !== undefined && { active: params.active }),
        ...(params?.limit && { limit: params.limit }),
        ...(params?.offset !== undefined && { offset: params.offset }),
        ...(params?.order_by && { order_by: params.order_by }),
        ...(params?.sort_order && { sort_order: params.sort_order }),
      },
    });
  }

  // ——— Invite ———

  /** Приглашение нового сотрудника (POST /api/v1/employees/invite) */
  static async invite(
    data: InviteEmployeeRequest
  ): Promise<InviteEmployeeResponse> {
    return apiClient.post<InviteEmployeeResponse>("api/v1/employees/invite", {
      ...data,
      phone: normalizePhone(data.phone),
    });
  }

  /** Подтверждение приглашения + установка пароля (POST /api/v1/employees/invite/confirm) */
  static async confirmInvite(
    data: ConfirmInviteRequest
  ): Promise<ConfirmInviteResponse> {
    return apiClient.post<ConfirmInviteResponse>(
      "api/v1/employees/invite/confirm",
      data
    );
  }

  /** Повторная отправка приглашения (POST /api/v1/employees/invite/resend) */
  static async resendInvite(
    data: ResendInviteRequest
  ): Promise<ResendInviteResponse> {
    return apiClient.post<ResendInviteResponse>(
      "api/v1/employees/invite/resend",
      { phone: normalizePhone(data.phone) }
    );
  }

  // ——— Employee management ———

  /** Активация сотрудника (POST /api/v1/employees/{id}/activate) */
  static async activate(id: string): Promise<void> {
    await apiClient.post(`api/v1/employees/${encodeURIComponent(id)}/activate`);
  }

  /** Деактивация сотрудника (POST /api/v1/employees/{id}/deactivate) */
  static async deactivate(id: string): Promise<void> {
    await apiClient.post(
      `api/v1/employees/${encodeURIComponent(id)}/deactivate`
    );
  }

  /** Смена роли (PATCH /api/v1/employees/{id}/role) — только owner */
  static async changeRole(id: string, role: TUserRole): Promise<void> {
    await apiClient.patch(`api/v1/employees/${encodeURIComponent(id)}/role`, {
      role,
    });
  }

  /** Смена прав доступа (PATCH /api/v1/employees/{id}/permissions) */
  static async changePermissions(
    id: string,
    data: IEmployeePermissions
  ): Promise<void> {
    await apiClient.patch(
      `api/v1/employees/${encodeURIComponent(id)}/permissions`,
      data
    );
  }

  /** Перевод на другую точку (POST /api/v1/employees/{id}/transfer) */
  static async transfer(id: string, location_id: string): Promise<void> {
    await apiClient.post(
      `api/v1/employees/${encodeURIComponent(id)}/transfer`,
      { location_id }
    );
  }
}
