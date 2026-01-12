import { GetStaffParams } from "@/src/shared/services/staff-service";

/**
 * Дефолтные значения фильтров для таблицы сотрудников
 */
export const DEFAULT_STAFF_FILTERS: GetStaffParams = {
  limit: 5,
  offset: 0,
  order_by: "created_at",
  sort_order: "asc",
};
