"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ServiceService,
  type CreateServiceRequestDto,
  type UpdateServiceRequestDto,
  type IServiceDto,
} from "../services/service-service";

/**
 * Хук для загрузки списка услуг локации
 */
export function useLocationServices(locationId: string | undefined) {
  return useQuery({
    queryKey: ["services", "location", locationId],
    queryFn: () => {
      if (!locationId) {
        throw new Error("Location ID is required");
      }
      return ServiceService.getLocationServices(locationId);
    },
    enabled: !!locationId,
    staleTime: 2 * 60 * 1000, // 2 минуты - услуги могут меняться чаще
  });
}

/**
 * Хук для загрузки дерева категорий услуг по типу бизнеса
 * @param locationCategoryId — UUID категории локации
 */
export function useServiceCategories(locationCategoryId: string | undefined) {
  return useQuery({
    queryKey: ["serviceCategories", locationCategoryId],
    queryFn: () => {
      if (!locationCategoryId) {
        throw new Error("Location category ID is required");
      }
      return ServiceService.getServiceCategories(locationCategoryId);
    },
    enabled: !!locationCategoryId,
    staleTime: 20 * 60 * 1000, // 20 минут — категории меняются редко
  });
}

/**
 * Хук для создания новой услуги
 * Инвалидирует кэш списка услуг после успешного создания
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation<IServiceDto, unknown, CreateServiceRequestDto>({
    mutationKey: ["services", "create"],
    mutationFn: (data: CreateServiceRequestDto) =>
      ServiceService.createService(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", "location", variables.location_id],
      });
      queryClient.invalidateQueries({ queryKey: ["services", "location"] });
    },
  });
}

/**
 * Хук для обновления услуги (PUT /api/v1/services/{id})
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; data: UpdateServiceRequestDto }
  >({
    mutationKey: ["services", "update"],
    mutationFn: ({ id, data }) => ServiceService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "location"] });
    },
  });
}

/**
 * Хук для удаления услуги (DELETE /api/v1/services/{id})
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["services", "delete"],
    mutationFn: id => ServiceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "location"] });
    },
  });
}
