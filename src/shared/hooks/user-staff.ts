"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EmployeeService,
  type GetEmployeesParams,
  type InviteEmployeeRequest,
  type InviteEmployeeResponse,
} from "../services/employee-service";
import type { IEmployeePermissions, TUserRole } from "../types/user";

/**
 * Хук для получения списка сотрудников (GET /api/v1/employees)
 * Запрос выполняется только если params определен
 */
export function useGetEmployees(params?: GetEmployeesParams) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => EmployeeService.getEmployees(params),
    enabled: !!params,
    staleTime: 30 * 1000, // 30 секунд
  });
}

/**
 * Хук для приглашения нового сотрудника (POST /api/v1/employees/invite)
 * Инвалидирует кэш списка сотрудников после успешного приглашения
 */
export function useInviteEmployee() {
  const queryClient = useQueryClient();

  return useMutation<InviteEmployeeResponse, unknown, InviteEmployeeRequest>({
    mutationKey: ["employees", "invite"],
    mutationFn: (data: InviteEmployeeRequest) => EmployeeService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Хук для активации сотрудника (POST /api/v1/employees/{id}/activate) */
export function useActivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["employees", "activate"],
    mutationFn: (id: string) => EmployeeService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Хук для деактивации сотрудника (POST /api/v1/employees/{id}/deactivate) */
export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["employees", "deactivate"],
    mutationFn: (id: string) => EmployeeService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Хук для смены роли сотрудника (PATCH /api/v1/employees/{id}/role) */
export function useChangeEmployeeRole() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; role: TUserRole }>({
    mutationKey: ["employees", "changeRole"],
    mutationFn: ({ id, role }) => EmployeeService.changeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/** Хук для смены прав доступа (PATCH /api/v1/employees/{id}/permissions) */
export function useChangeEmployeePermissions() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; permissions: IEmployeePermissions }
  >({
    mutationKey: ["employees", "changePermissions"],
    mutationFn: ({ id, permissions }) =>
      EmployeeService.changePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Хук для перевода сотрудника на другую точку (POST /api/v1/employees/{id}/transfer) */
export function useTransferEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; location_id: string }>({
    mutationKey: ["employees", "transfer"],
    mutationFn: ({ id, location_id }) =>
      EmployeeService.transfer(id, location_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
