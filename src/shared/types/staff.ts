import { IUserDto } from "./user";

export interface IStaffDto {
  count: number;
  users: IUserDto[];
}
