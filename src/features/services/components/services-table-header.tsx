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
 * Компонент заголовка таблицы услуг
 */
interface ServicesTableHeaderProps {
  columns: TableColumn[];
}

export function ServicesTableHeader({ columns }: ServicesTableHeaderProps) {
  const t = useTranslations("Services");

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
