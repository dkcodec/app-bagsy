/**
 * Хуки для работы с записями на прием
 * Используют Tanstack Query для управления состоянием
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../api/services";
import type {
  Appointment,
  AppointmentRequest,
  PaginationParams,
} from "../api/types";

// Ключи для кэширования
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (params?: PaginationParams) =>
    [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

/**
 * Хук для получения записей пользователя
 */
export function useUserAppointments(params?: PaginationParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.getUserAppointments(params),
    // Время жизни кэша - 2 минуты
    staleTime: 2 * 60 * 1000,
    // Время до удаления из кэша - 5 минут
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения всех записей (для администраторов)
 */
// export function useAllAppointments(params?: PaginationParams) {
//   return useQuery({
//     queryKey: appointmentKeys.list({ ...params, admin: true }),
//     queryFn: () => appointmentService.getAllAppointments(params),
//     staleTime: 2 * 60 * 1000,
//     gcTime: 5 * 60 * 1000,
//   });
// }

/**
 * Хук для получения записи по ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для создания записи
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentRequest) =>
      appointmentService.createAppointment(data),
    onSuccess: () => {
      // Инвалидируем список записей для обновления
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка создания записи:", error);
    },
  });
}

/**
 * Хук для обновления записи
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AppointmentRequest>;
    }) => appointmentService.updateAppointment(id, data),
    onSuccess: updatedAppointment => {
      // Обновляем кэш конкретной записи
      queryClient.setQueryData(
        appointmentKeys.detail(updatedAppointment.id),
        updatedAppointment
      );
      // Инвалидируем список записей
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка обновления записи:", error);
    },
  });
}

/**
 * Хук для отмены записи
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id),
    onSuccess: cancelledAppointment => {
      // Обновляем кэш конкретной записи
      queryClient.setQueryData(
        appointmentKeys.detail(cancelledAppointment.id),
        cancelledAppointment
      );
      // Инвалидируем список записей
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка отмены записи:", error);
    },
  });
}
