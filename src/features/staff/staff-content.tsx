"use client";

import { useState, useMemo } from "react";
import { useGetStaff } from "@/src/shared/hooks/user-staff";
import { GetStaffParams } from "@/src/shared/services/staff-service";
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
import { StaffFilters } from "./staff-filters";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { Pagination, type PaginationInfo } from "./components/pagination";
import { StaffTableHeader } from "./components/table-header";
import { StaffTableRow } from "./components/table-row";

/**
 * Компонент таблицы сотрудников с фильтрацией, сортировкой и пагинацией
 */
export function StaffContent() {
  const t = useTranslations("Staff");

  // Состояние фильтров
  const [filters, setFilters] = useState<GetStaffParams>({
    limit: 5,
    offset: 0,
    order_by: "created_at",
    sort_order: "asc",
  });

  // Получение данных
  const { data, isLoading, error } = useGetStaff(filters);

  // Обработка изменения сортировки
  const handleSort = (field: GetStaffParams["order_by"]) => {
    if (!field) return;

    setFilters(prev => ({
      ...prev,
      order_by: field,
      sort_order:
        prev.order_by === field && prev.sort_order === "asc" ? "desc" : "asc",
      offset: 0, // Сбрасываем пагинацию при изменении сортировки
    }));
  };

  // Обработка изменения страницы
  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({
      ...prev,
      offset: newOffset,
    }));
  };

  // Вычисление информации о пагинации
  const paginationInfo = useMemo<PaginationInfo>(() => {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    const total = data?.count || 0;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasNext = offset + limit < total;
    const hasPrev = offset > 0;

    return {
      currentPage,
      totalPages,
      hasNext,
      hasPrev,
      total,
      limit,
      offset,
    };
  }, [data?.count, filters.limit, filters.offset]);

  // Определение колонок таблицы
  const tableColumns = [
    { field: "name" as const, labelKey: "name", sortable: true },
    { field: "surname" as const, labelKey: "surname", sortable: true },
    { field: "phone" as const, labelKey: "phone", sortable: true },
    { field: undefined, labelKey: "role", sortable: false },
    { field: "point_code" as const, labelKey: "pointCode", sortable: true },
    { field: "network_code" as const, labelKey: "networkCode", sortable: true },
    { field: undefined, labelKey: "status", sortable: false },
    { field: "created_at" as const, labelKey: "createdAt", sortable: true },
  ];

  return (
    <div className="flex flex-col md:p-4">
      {/* Фильтры */}
      <StaffFilters filters={filters} onFiltersChange={setFilters} />

      {/* Таблица */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle>{t("tableTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ошибка загрузки */}
          {error && <ErrorMessage error={error} />}

          {/* Состояние загрузки */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Таблица */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <StaffTableHeader
                      columns={tableColumns}
                      orderBy={filters.order_by}
                      sortOrder={filters.sort_order}
                      onSort={handleSort}
                    />
                  </TableHeader>
                  <TableBody>
                    {!data?.users || data.users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.users.map(user => (
                        <StaffTableRow key={user.phone} user={user} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {data && data.count > 0 && (
                <Pagination
                  paginationInfo={paginationInfo}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
