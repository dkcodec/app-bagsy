"use client";

import { useState, useEffect, useMemo } from "react";
import { usePointServices } from "@/src/shared/hooks/use-services";
import { useNetworkPoints } from "@/src/shared/hooks/use-network-points";
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
import { PointSelect } from "./components/point-select";
import { AddServiceDialog } from "./components/add-service-dialog";

/**
 * Компонент таблицы услуг точки обслуживания
 */
export function ServicesContent() {
  const t = useTranslations("Services");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  // Определяем, нужно ли загружать точки сети
  const shouldLoadPoints =
    currentUser &&
    (currentUser.role === EUserRole.SELF_OWNER ||
      currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.ADMIN);

  // Загружаем точки сети для self_owner/net_manager
  // Для ADMIN используем usePointsPage если нужно, но пока используем useNetworkPoints
  const { data: networkPointsData } = useNetworkPoints(
    currentUser?.network_code
  );

  // Вычисляем selectedPointCode
  const selectedPointCode = useMemo(() => {
    // Для MANAGER используем point_code из currentUser
    if (currentUser?.role === EUserRole.MANAGER) {
      return currentUser.point_code;
    }

    // Для SELF_OWNER/NET_MANAGER используем первую точку из сети
    if (
      shouldLoadPoints &&
      networkPointsData &&
      networkPointsData.points.length > 0
    ) {
      return networkPointsData.points[0].code;
    }

    // Для ADMIN пока возвращаем undefined (можно расширить логику позже)
    return undefined;
  }, [currentUser, networkPointsData, shouldLoadPoints]);

  // Локальное состояние для выбранной точки (для селектора)
  const [localSelectedPointCode, setLocalSelectedPointCode] = useState<
    string | undefined
  >(selectedPointCode);

  // Синхронизируем локальное состояние с вычисленным значением
  useEffect(() => {
    if (selectedPointCode) {
      setLocalSelectedPointCode(selectedPointCode);
    }
  }, [selectedPointCode]);

  // Используем локальное состояние для запросов (если есть селектор) или вычисленное значение
  const pointCodeForQuery =
    shouldLoadPoints && localSelectedPointCode
      ? localSelectedPointCode
      : selectedPointCode;

  // Получение данных услуг
  const { data, isLoading, error } = usePointServices(pointCodeForQuery);

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
      {/* Селектор точки (только для self_owner/net_manager/admin) */}
      {shouldLoadPoints && (
        <div className="p-4">
          <PointSelect
            value={localSelectedPointCode}
            onValueChange={setLocalSelectedPointCode}
            networkCode={currentUser?.network_code}
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
            disabled={!pointCodeForQuery}
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
                          pointCode={pointCodeForQuery}
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
        pointCode={pointCodeForQuery}
      />
    </div>
  );
}
