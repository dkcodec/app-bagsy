"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeService } from "../services/employee-service";
import { UserService } from "../services/user-service";
import type {
  IEmployeeDto,
  UpdateEmployeeProfileRequest,
  UpdateScheduleRequest,
} from "../types/user";

/**
 * Получение текущего сотрудника (GET /api/v1/employees/me)
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => EmployeeService.getMe(),
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Получение информации о пользователе по номеру телефона
 * TODO: ждём новый эндпоинт от бэка
 */
export function useGetUserByPhone(phone: string) {
  return useQuery({
    queryKey: ["user", phone],
    queryFn: () => UserService.getUserByPhone(phone),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для обновления профиля сотрудника (PUT /api/v1/employees/me)
 * Включает оптимистичные обновления и инвалидацию кэша
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    IEmployeeDto,
    unknown,
    UpdateEmployeeProfileRequest,
    { previousData?: IEmployeeDto }
  >({
    mutationKey: ["me", "update"],
    mutationFn: async (data: UpdateEmployeeProfileRequest) =>
      EmployeeService.updateMe(data),
    onMutate: async newData => {
      await queryClient.cancelQueries({ queryKey: ["me"] });
      const previousData = queryClient.getQueryData<IEmployeeDto>(["me"]);

      // Оптимистично обновляем данные
      if (previousData) {
        queryClient.setQueryData<IEmployeeDto>(["me"], {
          ...previousData,
          ...newData,
        });
      }

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["me"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * Хук обновления расписания. PUT v1/users/me/schedule, инвалидация ["me"].
 * TODO: ждём новый эндпоинт от бэка
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, UpdateScheduleRequest>({
    mutationKey: ["me", "update-schedule"],
    mutationFn: (data: UpdateScheduleRequest) =>
      UserService.updateSchedule(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * Хук удаления аватара. DELETE v1/users/me/avatar, инвалидация ["me"].
 * TODO: ждём новый эндпоинт от бэка
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationKey: ["me", "delete-avatar"],
    mutationFn: () => UserService.deleteAvatar(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
