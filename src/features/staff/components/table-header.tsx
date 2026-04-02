import { TableHead, TableRow } from "@/src/entities";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";
import { SortIcon } from "./sort-icon";
import { useTranslations } from "next-intl";

interface TableColumn {
  field: GetEmployeesParams["order_by"];
  labelKey: string;
  sortable?: boolean;
  /** Скрыть колонку на мобилке (hidden md:table-cell) */
  hiddenMobile?: boolean;
}

interface TableHeaderProps {
  columns: TableColumn[];
  orderBy?: GetEmployeesParams["order_by"];
  sortOrder?: "asc" | "desc";
  onSort: (field: GetEmployeesParams["order_by"]) => void;
}

/**
 * Заголовок таблицы сотрудников — адаптивный (скрывает колонки на мобилке)
 */
export function StaffTableHeader({
  columns,
  orderBy,
  sortOrder,
  onSort,
}: TableHeaderProps) {
  const t = useTranslations("Staff");

  return (
    <TableRow>
      {columns.map(column => (
        <TableHead
          key={column.field || column.labelKey || "actions"}
          className={`
            ${column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
            ${column.hiddenMobile ? "hidden md:table-cell" : ""}
          `}
          onClick={() =>
            column.sortable && column.field && onSort(column.field)
          }
        >
          {column.labelKey ? (
            column.sortable ? (
              <div className="flex items-center">
                {t(column.labelKey)}
                <SortIcon
                  field={column.field}
                  currentField={orderBy}
                  sortOrder={sortOrder}
                />
              </div>
            ) : (
              t(column.labelKey)
            )
          ) : null}
        </TableHead>
      ))}
    </TableRow>
  );
}
