import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { GetStaffParams } from "@/src/shared/services/staff-service";

/**
 * Компонент иконки сортировки для заголовков таблицы
 */
interface SortIconProps {
  field: GetStaffParams["order_by"];
  currentField?: GetStaffParams["order_by"];
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
