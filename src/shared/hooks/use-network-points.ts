"use client";

import { useQuery } from "@tanstack/react-query";
import { PointService } from "../services/point-service";
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
