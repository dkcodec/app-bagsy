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
  created_at: string;
  name: string;
  network_code: string;
  phone: string;
  point_code: string;
  role: TUserRole;
  schedule: ISchedule[];
  surname: string;
  updated_at: string;
}

export interface ISchedule {
  all_day: boolean;
  close: string;
  comment: string;
  open: string;
  week_day: number;
}

export interface UpdateProfileRequest {
  avatar_id?: string;
  name: string;
  surname: string;
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
