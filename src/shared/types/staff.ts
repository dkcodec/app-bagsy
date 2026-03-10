import type { IEmployeeDto } from "./user";

/** Ответ GET /api/v1/employees */
export interface IEmployeesResponse {
  total: number;
  employees: IEmployeeDto[];
}

/** @deprecated Используй IEmployeesResponse */
export interface IStaffDto {
  total: number;
  users: IEmployeeDto[];
}
