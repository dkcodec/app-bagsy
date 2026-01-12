import { TableHead, TableRow } from "@/src/entities";
import { GetStaffParams } from "@/src/shared/services/staff-service";
import { SortIcon } from "./sort-icon";
import { useTranslations } from "next-intl";

/**
 * Интерфейс для колонки таблицы
 */
interface TableColumn {
  field: GetStaffParams["order_by"];
  labelKey: string;
  sortable?: boolean;
}

/**
 * Компонент заголовка таблицы сотрудников
 */
interface TableHeaderProps {
  columns: TableColumn[];
  orderBy?: GetStaffParams["order_by"];
  sortOrder?: "asc" | "desc";
  onSort: (field: GetStaffParams["order_by"]) => void;
}

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
          key={column.field || column.labelKey}
          className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
          onClick={() =>
            column.sortable && column.field && onSort(column.field)
          }
        >
          {column.sortable ? (
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
          )}
        </TableHead>
      ))}
    </TableRow>
  );
}
