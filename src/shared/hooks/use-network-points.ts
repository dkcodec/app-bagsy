"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PointService,
  type CreatePointRequestDto,
  type IPointDto,
} from "../services/point-service";
import { useCurrentUser } from "./use-users";
import { EUserRole } from "../types/user";

/**
 * Хук для загрузки списка точек сети
 * Автоматически отключается для ролей, которым не нужен выбор точки
 */
export function useNetworkPoints(networkCode: string | undefined) {
  const { data: currentUser } = useCurrentUser();

  // Определяем, нужно ли загружать точки
  const shouldFetch =
    networkCode &&
    currentUser &&
    (currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.SELF_OWNER);

  return useQuery({
    queryKey: ["networkPoints", networkCode],
    queryFn: () => {
      if (!networkCode) {
        throw new Error("Network code is required");
      }
      return PointService.getNetworkPoints(networkCode);
    },
    enabled: !!shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 минут - точки не меняются часто
  });
}

/**
 * Хук для загрузки списка точек для страницы points
 * Поддерживает роли MANAGER, SELF_OWNER, NET_MANAGER, ADMIN
 */
export function usePointsPage() {
  const { data: currentUser } = useCurrentUser();

  // Определяем network_code на основе роли
  const networkCode = currentUser?.network_code;

  // Проверяем, есть ли доступ (MANAGER и выше)
  const hasAccess =
    currentUser &&
    (currentUser.role === EUserRole.MANAGER ||
      currentUser.role === EUserRole.SELF_OWNER ||
      currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.ADMIN);

  return useQuery({
    queryKey: ["pointsPage", networkCode],
    queryFn: () => {
      if (!networkCode) {
        throw new Error("Network code is required");
      }
      return PointService.getNetworkPoints(networkCode);
    },
    enabled: !!hasAccess && !!networkCode,
    staleTime: 5 * 60 * 1000, // 5 минут - точки не меняются часто
  });
}

/**
 * Хук для загрузки списка категорий точек
 * Категории кэшируются на 10 минут, так как меняются редко
 */
export function usePointCategories() {
  return useQuery({
    queryKey: ["pointCategories"],
    queryFn: () => PointService.getPointCategories(),
    staleTime: 20 * 60 * 1000, // 20 минут - категории меняются редко
  });
}

/**
 * Хук для создания новой точки обслуживания
 * Инвалидирует кэш списка точек после успешного создания
 */
export function useCreatePoint() {
  const queryClient = useQueryClient();

  return useMutation<IPointDto, unknown, CreatePointRequestDto>({
    mutationKey: ["points", "create"],
    mutationFn: (data: CreatePointRequestDto) => PointService.createPoint(data),
    onSuccess: () => {
      // Инвалидируем кэш списка точек для обновления данных
      queryClient.invalidateQueries({ queryKey: ["pointsPage"] });
      queryClient.invalidateQueries({ queryKey: ["networkPoints"] });
    },
  });
}
