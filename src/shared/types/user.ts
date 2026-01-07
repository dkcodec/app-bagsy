export enum EUserRole {
  ADMIN = "admin",
  NET_MANAGER = "net_manager",
  MANAGER = "manager",
  WORKER = "worker",
}

export interface UserResponse {
  message?: string;
  code?: number;
}

export type TUserRole = (typeof EUserRole)[keyof typeof EUserRole];

export interface IUserDto {
  active: boolean;
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
  name: string;
  surname: string;
}

export interface UsersListResponseDto extends UserResponse {
  users: IUserDto[];
  count: number;
}

export interface UsersSearchRequest {
  network_code?: string;
  phone?: string[];
  point_code?: string;
  role?: TUserRole[];
}
