import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";

/**
 * Компонент иконки сортировки для заголовков таблицы
 */
interface SortIconProps {
  field: GetEmployeesParams["order_by"];
  currentField?: GetEmployeesParams["order_by"];
  sortOrder?: "asc" | "desc";
}

export function SortIcon({ field, currentField, sortOrder }: SortIconProps) {
  // Если поле не активно - показываем нейтральную иконку
  if (currentField !== field) {
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }

  // Показываем направление сортировки
  return sortOrder === "asc" ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  );
}
