/**
 * Роли пользователей.
 * Дополнительные права определяются атрибутами ABAC через permissions.
 */
export enum EUserRole {
  OWNER = "owner",
  MANAGER = "manager",
  STAFF = "staff",
}

export type TUserRole = (typeof EUserRole)[keyof typeof EUserRole];

/** Права сотрудника (ABAC) */
export interface IEmployeePermissions {
  can_provide_services: boolean;
  can_manage_location_schedule: boolean;
}

/**
 * Сотрудник организации (ответ GET /api/v1/employees/me и GET /api/v1/employees)
 */
export interface IEmployeeDto {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: TUserRole;
  /** UUID организации */
  organization_id: string;
  /** UUID текущей локации */
  location_id: string;
  active: boolean;
  /** ISO 8601 с таймзоной */
  created_at: string;
  /** Права доступа (ABAC) */
  permissions: IEmployeePermissions;
}

/** Запрос обновления профиля (PUT /api/v1/employees/me) */
export interface UpdateEmployeeAccountRequest {
  first_name: string;
  last_name: string;
  avatar_id?: string;
}

/**
 * @deprecated Старый тип пользователя — используй IEmployeeDto.
 * Оставлен для сервисов которые ещё не мигрировали (schedule, getUserByPhone).
 */
export interface IUserDto {
  id?: string;
  active: boolean;
  avatar_url?: string;
  created_at: string;
  first_name: string;
  last_name?: string;
  phone: string;
  role: TUserRole;
  organization_id?: string;
  location_id?: string;
  can_provide_services?: boolean;
  can_manage_location_schedule?: boolean;
  schedule: ISchedule[];
  updated_at: string;
  /** @deprecated используй first_name */
  name: string;
  /** @deprecated используй last_name */
  surname: string;
  /** @deprecated используй organization_id */
  network_code?: string;
  /** @deprecated используй location_id */
  point_code?: string;
}

export interface ISchedule {
  all_day: boolean;
  /** ISO 8601 с таймзоной */
  close: string;
  comment: string;
  /** ISO 8601 с таймзоной */
  open: string;
  week_day: number;
}

/** @deprecated Используй UpdateEmployeeAccountRequest */
export interface UpdateAccountRequest {
  avatar_id?: string;
  name: string;
  surname: string;
}

/** Элемент расписания для PUT /api/v1/users/me/schedule */
export interface UpdateScheduleItemRequest {
  week_day: number;
  /** ISO 8601 с offset таймзоны (время суток, опорная дата 1970-01-01). */
  from: string;
  /** ISO 8601 с offset таймзоны (время суток). */
  to: string;
  all_day: boolean;
  comment: string;
}

export interface UpdateScheduleRequest {
  schedule: UpdateScheduleItemRequest[];
}

export interface UserResponse {
  message?: string;
  code?: number;
}

export interface UsersListResponseDto extends UserResponse {
  users: IUserDto[];
  total: number;
}

export interface UsersSearchRequest {
  network_code?: string;
  phone?: string[];
  point_code?: string;
  role?: TUserRole[];
}
