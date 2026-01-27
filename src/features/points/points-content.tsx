"use client";

import { useState } from "react";
import { usePointsPage } from "@/src/shared/hooks/use-network-points";
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
import { PointsTableHeader } from "./components/table-header";
import { PointsTableRow } from "./components/table-row";
import { AddPointDialog } from "./components/add-point-dialog";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";

/**
 * Компонент таблицы точек обслуживания
 */
export function PointsContent() {
  const t = useTranslations("Points");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  // Получение данных
  const { data, isLoading, error } = usePointsPage();

  const disableAddButton =
    isLoading ||
    (currentUser?.role === EUserRole.SELF_OWNER &&
      data?.points?.length &&
      data.points.length > 0);

  // Определение колонок таблицы
  const tableColumns = [
    { field: "code", labelKey: "code", sortable: false },
    { field: "name", labelKey: "name", sortable: false },
    { field: "address", labelKey: "address", sortable: false },
    { field: "schedule", labelKey: "schedule.title", sortable: false },
    { field: "status", labelKey: "status", sortable: false },
    { field: "createdAt", labelKey: "createdAt", sortable: false },
  ];

  return (
    <div className="flex flex-col md:p-4">
      {/* Таблица */}
      <Card className="border-none bg-background">
        <CardHeader className="flex flex-row justify-between items-center px-6 py-2">
          <CardTitle>{t("tableTitle")}</CardTitle>
          {!disableAddButton && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("addPoint")}
            </Button>
          )}
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
                    <PointsTableHeader columns={tableColumns} />
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        {Array.from({ length: tableColumns.length }).map(
                          (_, i) => (
                            <TableCell key={i} className="h-12">
                              <Skeleton className="h-12 w-full" />
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ) : !data?.points || data.points.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.points.map(point => (
                        <PointsTableRow key={point.code} point={point} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления точки */}
      <AddPointDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
