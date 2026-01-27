import { TableCell, TableRow, Badge } from "@/src/entities";
import { IServiceDto } from "@/src/shared/services/service-service";
import { useTranslations } from "next-intl";
import { AttachMasterPopover } from "./attach-master-popover";
import { useState } from "react";
import { AttachMasterDialog } from "./attach-master-dialog";

/**
 * Компонент строки таблицы услуг
 */
interface ServicesTableRowProps {
  service: IServiceDto;
  /** Код точки для загрузки списка мастеров */
  pointCode?: string;
}

export function ServicesTableRow({
  service,
  pointCode,
}: ServicesTableRowProps) {
  const t = useTranslations("Services");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Форматируем цену
  const formatPrice = (min: number, max: number) => {
    if (min === max) {
      return `${min} ₸`;
    }
    return `${min} - ${max} ₸`;
  };

  // Форматируем длительность
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}ч ${mins}м`;
    }
    if (hours > 0) {
      return `${hours}ч`;
    }
    return `${mins}м`;
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{service.name}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {service.description || "-"}
        </TableCell>
        <TableCell>{formatDuration(service.duration_minutes)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: service.color }}
            />
            <span className="text-sm">{service.color}</span>
          </div>
        </TableCell>
        <TableCell>
          {formatPrice(service.min_price, service.max_price)}
        </TableCell>
        {/* 
        <TableCell>
          <Badge variant={service.active ? "default" : "outline"}>
            {service.active ? t("active") : t("inactive")}
          </Badge>
        </TableCell>
        */}
        {/* Колонка для привязки мастера */}
        <TableCell>
          <AttachMasterPopover
            service={service}
            pointCode={pointCode}
            onOpenDialog={() => setIsDialogOpen(true)}
          />
        </TableCell>
      </TableRow>

      {/* Диалог для полной формы привязки мастера */}
      <AttachMasterDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={service}
        pointCode={pointCode}
      />
    </>
  );
}
