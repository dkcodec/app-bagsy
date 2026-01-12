import { useQuery } from "@tanstack/react-query";
import { StaffService, GetStaffParams } from "../services/staff-service";

/**
 * Хук для получения списка сотрудников с фильтрацией, сортировкой и пагинацией
 */
export function useGetStaff(params?: GetStaffParams) {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: () => StaffService.getStaff(params),
    staleTime: 30 * 1000, // 30 секунд
  });
}
