export enum EUserRole {
  ADMIN = "admin",
  NET_MANAGER = "net_manager",
  SELF_OWNER = "self_owner",
  MANAGER = "manager",
  STAFF = "staff",
}

export interface UserResponse {
  message?: string;
  code?: number;
}

export type TUserRole = (typeof EUserRole)[keyof typeof EUserRole];

export interface IUserDto {
  active: boolean;
  avatar_url?: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  created_at: string;
  name: string;
  network_code: string;
  phone: string;
  point_code: string;
  role: TUserRole;
  schedule: ISchedule[];
  surname: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm). */
  updated_at: string;
}

export interface ISchedule {
  all_day: boolean;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm); на бэк шлём с offset. */
  close: string;
  comment: string;
  /** С бэка всегда ISO 8601 с таймзоной (Z или ±HH:mm); на бэк шлём с offset. */
  open: string;
  week_day: number;
}

export interface UpdateProfileRequest {
  avatar_id?: string;
  name: string;
  surname: string;
}

/** Элемент расписания для PUT /api/v1/users/me/schedule (from/to вместо open/close). */
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
