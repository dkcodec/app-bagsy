"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MasterService,
  type CreateEmployeeServiceRequest,
  type CreateEmployeeServiceResponse,
} from "../services/master-service";

/**
 * Хук для отвязки сотрудника от услуги DELETE /api/v1/employee-services/{id}
 * TODO: эндпоинт на беке ещё не готов — подключить когда появится
 */
export function useRemoveMasterService() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["employee-services", "remove"],
    mutationFn: (id: string) => MasterService.removeMasterService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", "location"] });
      queryClient.invalidateQueries({ queryKey: ["employee-services"] });
    },
  });
}

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
      // Обновляем список услуг локации и карту сотрудник-услуга
      queryClient.invalidateQueries({ queryKey: ["services", "location"] });
      queryClient.invalidateQueries({ queryKey: ["employee-services"] });
    },
  });
}
