"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MasterService,
  type CreateMasterServiceRequestDto,
  type CreateMasterServiceResponseDto,
} from "../services/master-service";

/**
 * Хук для создания связи мастер-услуга
 * Инвалидирует кэш списка услуг после успешного создания
 */
export function useCreateMasterService() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateMasterServiceResponseDto,
    unknown,
    CreateMasterServiceRequestDto
  >({
    mutationKey: ["master-services", "create"],
    mutationFn: (data: CreateMasterServiceRequestDto) =>
      MasterService.createMasterService(data),
    onSuccess: () => {
      // Инвалидируем кэш услуг для обновления данных в таблице
      queryClient.invalidateQueries({ queryKey: ["services", "point"] });
    },
  });
}
