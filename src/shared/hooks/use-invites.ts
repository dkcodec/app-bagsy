/**
 * Хуки для работы с приглашениями
 * Используют Tanstack Query для управления состоянием
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteService } from "../api/services";
import type {
  InviteRequest,
  InviteResponse,
  PaginationParams,
} from "../api/types";

// Ключи для кэширования
export const inviteKeys = {
  all: ["invites"] as const,
  lists: () => [...inviteKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...inviteKeys.lists(), params] as const,
  details: () => [...inviteKeys.all, "detail"] as const,
  detail: (token: string) => [...inviteKeys.details(), token] as const,
};

/**
 * Хук для получения списка приглашений
 */
export function useInvites(params?: PaginationParams) {
  return useQuery({
    queryKey: inviteKeys.list(params),
    queryFn: () => inviteService.getInvites(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для получения приглашения по токену
 */
export function useInviteByToken(token: string) {
  return useQuery({
    queryKey: inviteKeys.detail(token),
    queryFn: () => inviteService.getInviteByToken(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Хук для создания приглашения
 */
export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteRequest) => inviteService.createInvite(data),
    onSuccess: () => {
      // Инвалидируем список приглашений для обновления
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка создания приглашения:", error);
    },
  });
}

/**
 * Хук для принятия приглашения
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      userData,
    }: {
      token: string;
      userData: { name: string; password: string };
    }) => inviteService.acceptInvite(token, userData),
    onSuccess: data => {
      // Очищаем кэш приглашения
      queryClient.removeQueries({
        queryKey: inviteKeys.detail(data.user.phone),
      });
      // Инвалидируем список приглашений
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка принятия приглашения:", error);
    },
  });
}

/**
 * Хук для отмены приглашения
 */
export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inviteService.cancelInvite(id),
    onSuccess: () => {
      // Инвалидируем список приглашений
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() });
    },
    onError: error => {
      console.error("Ошибка отмены приглашения:", error);
    },
  });
}
