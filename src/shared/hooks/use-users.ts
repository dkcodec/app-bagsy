"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserService,
} from "../services/user-service";
import type { UpdateProfileRequest, IUserDto } from "../types/user";

/**
 * Получение текущего пользователя
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => UserService.getMe(),
    staleTime: 30 * 60 * 1000, // 30 минут - пользователь не меняется часто
    gcTime: 60 * 60 * 1000, // 1 час в кеше
    retry: 1,
    refetchOnWindowFocus: false, // не перезапрашивать при фокусе окна
    refetchOnMount: false, // не перезапрашивать при монтировании если есть кеш
  });
}

/**
 * Получение информации о пользователе по номеру телефона
 */
export function useGetUserByPhone(phone: string) {
  return useQuery({
    queryKey: ["user", phone],
    queryFn: () => UserService.getUserByPhone(phone),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для обновления профиля пользователя
 * Включает оптимистичные обновления и инвалидацию кэша
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<IUserDto, unknown, UpdateProfileRequest>({
    mutationKey: ["me", "update"],
    mutationFn: async (data: UpdateProfileRequest) => UserService.updateMe(data),
    onMutate: async newData => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["me"] });

      // Сохраняем предыдущие данные для отката
      const previousData = queryClient.getQueryData(["me"]);

      // Оптимистично обновляем данные только если они есть
      if (
        previousData &&
        typeof previousData === "object" &&
        "data" in previousData &&
        (previousData as { data: IUserDto }).data
      ) {
        const prevUser = (previousData as { data: IUserDto }).data;
        queryClient.setQueryData(["me"], {
          ...previousData,
          data: {
            ...prevUser,
            ...newData,
            updated_at: new Date().toISOString(),
          },
        });
      }

      return { previousData };
    },
    onError: (err, newData, context) => {
      // Откатываем изменения при ошибке
      if (context && typeof context === "object" && "previousData" in context) {
        const prevData = (context as { previousData?: unknown }).previousData;
        if (prevData) {
          queryClient.setQueryData(["me"], prevData);
        }
      }
    },
    onSettled: () => {
      // Инвалидируем кэш для получения актуальных данных
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
