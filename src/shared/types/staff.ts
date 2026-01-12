import { IUserDto } from "./user";

export interface IStaffDto {
  total: number;
  users: IUserDto[];
}
