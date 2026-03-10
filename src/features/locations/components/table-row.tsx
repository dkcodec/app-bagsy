import { TableCell, TableRow, Badge } from "@/src/entities";
import { ILocationDto } from "@/src/shared/services/location-service";
import { formatDate } from "@/src/shared/utils/formater";
import { useTranslations, useLocale } from "next-intl";

/**
 * Компонент строки таблицы точек
 */
interface LocationsTableRowProps {
  point: ILocationDto;
}

export function LocationsTableRow({ point }: LocationsTableRowProps) {
  const t = useTranslations("Locations");
  const locale = useLocale();

  // Маппинг локали для форматирования даты
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  // Форматируем адрес
  const address = point.address
    ? `${point.address.street}, ${point.address.city}`
    : "";

  return (
    <TableRow>
      <TableCell className="font-medium">
        {point.id.slice(0, 4)}...{point.id.slice(-4)}
      </TableCell>
      <TableCell>{point.name}</TableCell>
      <TableCell className="text-sm">{address}</TableCell>
      <TableCell className="text-sm">{point.schedule_type || "—"}</TableCell>
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
