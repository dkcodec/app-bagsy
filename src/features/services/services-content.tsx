"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocationServices } from "@/src/shared/hooks/use-services";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
} from "@/src/entities";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { ServicesTableHeader } from "./components/services-table-header";
import { ServicesTableRow } from "./components/services-table-row";
import { LocationSelect } from "./components/location-select";
import { AddServiceDialog } from "./components/add-service-dialog";

/**
 * Компонент таблицы услуг локации обслуживания
 */
export function ServicesContent() {
  const t = useTranslations("Services");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  // Определяем, нужно ли загружать локации сети (только для Owner)
  const shouldLoadLocations =
    currentUser && currentUser.role === EUserRole.OWNER;

  // Загружаем локации организации для Owner
  const { data: locationsData } = useLocations();

  // Вычисляем selectedLocationId
  const selectedLocationId = useMemo(() => {
    // Для MANAGER используем location_id из currentUser
    if (currentUser?.role === EUserRole.MANAGER) {
      return currentUser.location_id;
    }

    // Для Owner используем первую локацию из списка
    if (
      shouldLoadLocations &&
      locationsData &&
      locationsData.locations.length > 0
    ) {
      return locationsData.locations[0].id;
    }

    return undefined;
  }, [currentUser, locationsData, shouldLoadLocations]);

  // Локальное состояние для выбранной локации (для селектора)
  const [localSelectedLocationId, setLocalSelectedLocationId] = useState<
    string | undefined
  >(selectedLocationId);

  // Синхронизируем локальное состояние с вычисленным значением
  useEffect(() => {
    if (selectedLocationId) {
      setLocalSelectedLocationId(selectedLocationId);
    }
  }, [selectedLocationId]);

  // Используем локальное состояние для запросов (если есть селектор) или вычисленное значение
  const locationIdForQuery =
    shouldLoadLocations && localSelectedLocationId
      ? localSelectedLocationId
      : selectedLocationId;

  // Получение данных услуг
  const { data, isLoading, error } = useLocationServices(locationIdForQuery);

  // Определение колонок таблицы
  const tableColumns = [
    { field: "name", labelKey: "table.name", sortable: false },
    { field: "description", labelKey: "table.description", sortable: false },
    { field: "duration", labelKey: "table.duration", sortable: false },
    { field: "color", labelKey: "table.color", sortable: false },
    { field: "price", labelKey: "table.price", sortable: false },
    //{ field: "status", labelKey: "table.status", sortable: false },
    { field: "masters", labelKey: "table.masters", sortable: false },
  ];

  return (
    <div className="flex flex-col md:p-4">
      {/* Селектор локации (только для owner) */}
      {shouldLoadLocations && (
        <div className="p-4">
          <LocationSelect
            value={localSelectedLocationId}
            onValueChange={setLocalSelectedLocationId}
          />
        </div>
      )}

      {/* Таблица */}
      <Card className="border-none bg-background">
        <CardHeader className="flex flex-row justify-between items-center px-6 py-2">
          <CardTitle>{t("tableTitle")}</CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="flex items-center gap-2"
            disabled={!locationIdForQuery}
          >
            <Plus className="h-4 w-4" />
            {t("addService")}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Состояние загрузки */}
          {error ? (
            /* Ошибка загрузки */
            <ErrorMessage error={error} />
          ) : (
            <>
              {/* Таблица */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <ServicesTableHeader columns={tableColumns} />
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        {Array.from({ length: tableColumns.length }).map(
                          (_, i) => (
                            <TableCell key={i} className="h-12 w-full">
                              <Skeleton className="h-12 w-full" />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ) : !data?.services || data.services.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={tableColumns.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.services.map(service => (
                        <ServicesTableRow
                          key={service.id}
                          service={service}
                          locationId={locationIdForQuery}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления услуги */}
      <AddServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        locationId={locationIdForQuery}
      />
    </div>
  );
}
