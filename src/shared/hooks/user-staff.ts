"use client";

import { useMemo } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  EmployeeService,
  type GetEmployeesParams,
  type InviteEmployeeRequest,
  type InviteEmployeeResponse,
} from "../services/employee-service";
import { EUserRole } from "../types/user";
import type {
  IEmployeeDto,
  IEmployeePermissions,
  TUserRole,
} from "../types/user";

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

/** Хелпер: оптимистично обновить сотрудника во всех кэшах ["employees", ...] */
function optimisticUpdateEmployee(
  queryClient: ReturnType<typeof useQueryClient>,
  employeeId: string,
  updater: (emp: IEmployeeDto) => IEmployeeDto
) {
  queryClient.setQueriesData<{ employees: IEmployeeDto[]; total: number }>(
    { queryKey: ["employees"] },
    old => {
      if (!old) return old;
      return {
        ...old,
        employees: old.employees.map(e =>
          e.id === employeeId ? updater(e) : e
        ),
      };
    }
  );
}

/** Хук для активации сотрудника (POST /api/v1/employees/{id}/activate) */
export function useActivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["employees", "activate"],
    mutationFn: (id: string) => EmployeeService.activate(id),
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      optimisticUpdateEmployee(queryClient, id, e => ({ ...e, active: true }));
    },
    onSettled: () => {
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
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      optimisticUpdateEmployee(queryClient, id, e => ({
        ...e,
        active: false,
      }));
    },
    onSettled: () => {
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
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      optimisticUpdateEmployee(queryClient, id, e => ({ ...e, role }));
    },
    onSettled: () => {
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
    onMutate: async ({ id, permissions }) => {
      await queryClient.cancelQueries({ queryKey: ["employees"] });
      optimisticUpdateEmployee(queryClient, id, e => ({
        ...e,
        permissions,
      }));
    },
    onSettled: () => {
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

/** Хук для отвязки сотрудника от точки (DELETE /api/v1/employees/{id}/location) */
export function useRemoveEmployeeFromLocation() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationKey: ["employees", "removeFromLocation"],
    mutationFn: (id: string) => EmployeeService.removeFromLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

/** Хук для получения услуг сотрудника (GET /api/v1/employees/{id}/services) */
export function useGetEmployeeServices(id: string | undefined) {
  return useQuery({
    queryKey: ["employee-services", id],
    queryFn: () => EmployeeService.getEmployeeServices(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/** Сотрудник привязанный к услуге */
export interface ServiceStaffMember {
  employee: IEmployeeDto;
  price: number;
  /** ID привязки (employee_service) для DELETE */
  employeeServiceId: string;
}

/**
 * Map serviceId → сотрудники с ценами
 * Загружает сотрудников локации, затем для каждого — его услуги,
 * и строит обратную map serviceId → [{employee, price}]
 */
export function useServiceStaffMap(locationId: string | undefined) {
  // Загружаем ВСЕХ сотрудников локации (включая owner)
  const { data: employeesData } = useGetEmployees(
    locationId
      ? {
          location_id: locationId,
          role: [
            EUserRole.STAFF,
            EUserRole.MANAGER,
            EUserRole.OWNER,
          ] as TUserRole[],
        }
      : undefined
  );

  const employees = employeesData?.employees || [];

  // Параллельно загружаем услуги каждого сотрудника
  const serviceQueries = useQueries({
    queries: employees.map(emp => ({
      queryKey: ["employee-services", emp.id],
      queryFn: () => EmployeeService.getEmployeeServices(emp.id),
      staleTime: 2 * 60 * 1000,
      enabled: !!emp.id,
    })),
  });

  const isLoading = !employeesData || serviceQueries.some(q => q.isLoading);

  // Стабильный ключ для пересчёта — JSON всех data (размер массива не меняется)
  const queriesDataKey = JSON.stringify(serviceQueries.map(q => q.data));

  // Мемоизируем map serviceId → [{employee, price}]
  const staffMap = useMemo(() => {
    const map = new Map<string, ServiceStaffMember[]>();
    if (isLoading) return map;

    employees.forEach((emp, i) => {
      const services = serviceQueries[i]?.data?.services || [];
      for (const svc of services) {
        if (!map.has(svc.id)) map.set(svc.id, []);
        map.get(svc.id)!.push({ employee: emp, price: svc.price, employeeServiceId: svc.employee_service_id });
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, employees, queriesDataKey]);

  return { staffMap, isLoading };
}
