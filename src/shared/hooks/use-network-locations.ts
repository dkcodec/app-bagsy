"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LocationService,
  type GetLocationsParams,
  type CreateLocationRequestDto,
  type CreateLocationResponseDto,
} from "../services/location-service";
import { useCurrentUser } from "./use-users";
import { EUserRole } from "../types/user";

/**
 * Хук для загрузки списка локаций организации (GET /api/v1/locations)
 * Автоматически отключается для ролей, которым не нужен выбор локации
 */
export function useLocations(params?: GetLocationsParams) {
  const { data: currentUser } = useCurrentUser();

  // Только Owner может запрашивать список локаций
  const shouldFetch = currentUser && currentUser.role === EUserRole.OWNER;

  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => LocationService.getLocations(params),
    enabled: !!shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 минут — локации не меняются часто
  });
}

/**
 * Хук для загрузки одной локации по ID (GET /api/v1/locations/{id})
 */
export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => LocationService.getLocation(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для загрузки списка локаций для страницы locations
 * Поддерживает роли Owner и Manager
 */
export function useLocationsPage() {
  const { data: currentUser } = useCurrentUser();

  // Проверяем, есть ли доступ (Manager и выше)
  const hasAccess =
    currentUser &&
    (currentUser.role === EUserRole.MANAGER ||
      currentUser.role === EUserRole.OWNER);

  return useQuery({
    queryKey: ["locations", "page"],
    queryFn: () => LocationService.getLocations(),
    enabled: !!hasAccess,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Хук для загрузки категорий локаций (GET /api/v1/locations/categories)
 * Категории кэшируются на 20 минут, так как меняются редко
 */
export function useLocationCategories() {
  return useQuery({
    queryKey: ["locationCategories"],
    queryFn: () => LocationService.getLocationCategories(),
    staleTime: 20 * 60 * 1000,
  });
}

/** @deprecated Используй useLocationCategories */
export const usePointCategories = useLocationCategories;

/**
 * Хук для создания новой локации обслуживания (POST /api/v1/locations)
 * Инвалидирует кэш списка локаций после успешного создания
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateLocationResponseDto,
    unknown,
    CreateLocationRequestDto
  >({
    mutationKey: ["locations", "create"],
    mutationFn: (data: CreateLocationRequestDto) =>
      LocationService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

/** @deprecated Используй useLocations */
export const useNetworkLocations = useLocations;
