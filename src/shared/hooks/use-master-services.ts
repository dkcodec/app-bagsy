"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MasterService,
  type CreateEmployeeServiceRequest,
  type CreateEmployeeServiceResponse,
} from "../services/master-service";

/**
 * Хук для привязки сотрудника к услуге POST /api/v1/employee-services
 * Инвалидирует кэш списка услуг после успешного создания
 */
export function useCreateMasterService() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateEmployeeServiceResponse,
    unknown,
    CreateEmployeeServiceRequest
  >({
    mutationKey: ["employee-services", "create"],
    mutationFn: (data: CreateEmployeeServiceRequest) =>
      MasterService.createMasterService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "point"] });
    },
  });
}
