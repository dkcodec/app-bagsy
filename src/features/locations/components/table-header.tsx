import { TableHead, TableRow } from "@/src/entities";
import { useTranslations } from "next-intl";

/**
 * Интерфейс для колонки таблицы
 */
interface TableColumn {
  field?: string;
  labelKey: string;
  sortable?: boolean;
}

/**
 * Компонент заголовка таблицы точек
 */
interface LocationsTableHeaderProps {
  columns: TableColumn[];
}

export function LocationsTableHeader({ columns }: LocationsTableHeaderProps) {
  const t = useTranslations("Locations");

  return (
    <TableRow>
      {columns.map(column => (
        <TableHead key={column.field || column.labelKey}>
          {t(column.labelKey)}
        </TableHead>
      ))}
    </TableRow>
  );
}
