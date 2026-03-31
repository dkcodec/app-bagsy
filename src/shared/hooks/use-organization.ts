"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrganizationService,
  type UpdateOrganizationRequest,
  type UpdateOrganizationResponse,
} from "../services/organization-service";

/**
 * Хук для обновления профиля организации (PUT /api/v1/organizations/me)
 * Используется при создании сети — задаёт название и описание
 * Инвалидирует кэш ["me"], т.к. organization вложена в /employees/me
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateOrganizationResponse,
    unknown,
    UpdateOrganizationRequest
  >({
    mutationKey: ["organization", "update"],
    mutationFn: (data: UpdateOrganizationRequest) =>
      OrganizationService.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
