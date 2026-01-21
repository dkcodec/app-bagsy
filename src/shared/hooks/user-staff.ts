import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  StaffService,
  GetStaffParams,
  RegisterStaffRequest,
  RegisterStaffResponse,
} from "../services/staff-service";

/**
 * Хук для получения списка сотрудников с фильтрацией, сортировкой и пагинацией
 * Запрос выполняется только если params определен
 */
export function useGetStaff(params?: GetStaffParams) {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: () => StaffService.getStaff(params),
    enabled: !!params, // Запрос выполняется только если params определен
    staleTime: 30 * 1000, // 30 секунд
  });
}

/**
 * Хук для регистрации нового сотрудника
 * Инвалидирует кэш списка сотрудников после успешной регистрации
 */
export function useRegisterStaff() {
  const queryClient = useQueryClient();

  return useMutation<RegisterStaffResponse, unknown, RegisterStaffRequest>({
    mutationKey: ["staff", "register"],
    mutationFn: (data: RegisterStaffRequest) =>
      StaffService.registerStaff(data),
    onSuccess: () => {
      // Инвалидируем кэш списка сотрудников для обновления данных
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}
