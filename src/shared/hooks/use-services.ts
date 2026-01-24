"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ServiceService,
  type CreateServiceRequestDto,
  type IServiceDto,
} from "../services/service-service";

/**
 * Хук для загрузки списка услуг точки
 */
export function usePointServices(pointCode: string | undefined) {
  return useQuery({
    queryKey: ["services", "point", pointCode],
    queryFn: () => {
      if (!pointCode) {
        throw new Error("Point code is required");
      }
      return ServiceService.getPointServices(pointCode);
    },
    enabled: !!pointCode,
    staleTime: 2 * 60 * 1000, // 2 минуты - услуги могут меняться чаще
  });
}

/**
 * Хук для загрузки списка категорий услуг и их подкатегорий
 * Категории кэшируются на 20 минут, так как меняются редко
 */
export function useServiceCategories(pointCode: string | undefined) {
  return useQuery({
    queryKey: ["serviceCategories", pointCode],
    queryFn: () => {
      if (!pointCode) {
        throw new Error("Point code is required");
      }
      return ServiceService.getServiceCategories(pointCode);
    },
    enabled: !!pointCode,
    staleTime: 20 * 60 * 1000, // 20 минут - категории меняются редко
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
      // Инвалидируем кэш списка услуг для обновления данных
      queryClient.invalidateQueries({
        queryKey: ["services", "point", variables.point_code],
      });
      // Также инвалидируем все запросы услуг точки (на случай если есть другие запросы)
      queryClient.invalidateQueries({ queryKey: ["services", "point"] });
    },
  });
}
