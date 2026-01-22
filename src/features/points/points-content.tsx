"use client";

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
} from "@/src/entities";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { PointsTableHeader } from "./components/table-header";
import { PointsTableRow } from "./components/table-row";

/**
 * Компонент таблицы точек обслуживания
 */
export function PointsContent() {
  const t = useTranslations("Points");

  // Получение данных
  const { data, isLoading, error } = usePointsPage();

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
      <Card className="border-none">
        <CardHeader className="flex flex-row justify-between items-center px-6 py-2">
          <CardTitle>{t("tableTitle")}</CardTitle>
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
                            <TableCell key={i} className="h-12 w-full">
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
    </div>
  );
}
