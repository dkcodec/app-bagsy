import type { GetEmployeesParams } from "@/src/shared/services/employee-service";

/**
 * Дефолтные значения фильтров для таблицы сотрудников
 */
export const DEFAULT_STAFF_FILTERS: GetEmployeesParams = {
  limit: 5,
  offset: 0,
  order_by: "created_at",
  sort_order: "asc",
};
