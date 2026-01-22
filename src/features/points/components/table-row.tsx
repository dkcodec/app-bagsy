import { TableCell, TableRow, Badge } from "@/src/entities";
import { IPointDto } from "@/src/shared/services/point-service";
import { formatDate } from "@/src/shared/utils/formater";
import { useTranslations, useLocale } from "next-intl";
import { ScheduleCell } from "./schedule-cell";

/**
 * Компонент строки таблицы точек
 */
interface PointsTableRowProps {
  point: IPointDto;
}

export function PointsTableRow({ point }: PointsTableRowProps) {
  const t = useTranslations("Points");
  const locale = useLocale();

  // Маппинг локали для форматирования даты
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  // Форматируем адрес
  const address = `${point.address.street}, ${point.address.city}`;

  return (
    <TableRow>
      <TableCell className="font-medium">{point.code}</TableCell>
      <TableCell>{point.name}</TableCell>
      <TableCell className="text-sm">{address}</TableCell>
      <TableCell>
        <ScheduleCell schedule={point.schedule} />
      </TableCell>
      <TableCell>
        <Badge variant={point.active ? "default" : "outline"}>
          {point.active ? t("active") : t("inactive")}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(point.created_at, dateLocale)}
      </TableCell>
    </TableRow>
  );
}
