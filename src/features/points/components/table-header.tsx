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
interface PointsTableHeaderProps {
  columns: TableColumn[];
}

export function PointsTableHeader({ columns }: PointsTableHeaderProps) {
  const t = useTranslations("Points");

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
