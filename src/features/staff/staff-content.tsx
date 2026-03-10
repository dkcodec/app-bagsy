"use client";

import { useState, useMemo } from "react";
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";
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
import { StaffFilters } from "./staff-filters";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { Pagination, type PaginationInfo } from "./components/pagination";
import { StaffTableHeader } from "./components/table-header";
import { StaffTableRow } from "./components/table-row";
import { DEFAULT_STAFF_FILTERS } from "./constants";
import { Plus } from "lucide-react";
import { AddStaffDialog } from "./add-staff-dialog";
import { useDisclosure } from "@/src/shared/hooks";

/**
 * Компонент таблицы сотрудников с фильтрацией, сортировкой и пагинацией
 */
export function StaffContent() {
  const t = useTranslations("Staff");

  // Состояние фильтров
  const [filters, setFilters] = useState<GetEmployeesParams>(DEFAULT_STAFF_FILTERS);

  // Управление диалогом добавления сотрудника
  const addStaffDialog = useDisclosure();

  // Получение данных
  const { data, isLoading, error } = useGetEmployees(filters);

  // Обработка изменения сортировки
  const handleSort = (field: GetEmployeesParams["order_by"]) => {
    if (!field) return;

    setFilters(prev => ({
      ...prev,
      order_by: field,
      sort_order:
        prev.order_by === field && prev.sort_order === "asc" ? "desc" : "asc",
      offset: 0,
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
    const limit = filters.limit || DEFAULT_STAFF_FILTERS.limit!;
    const offset = filters.offset || DEFAULT_STAFF_FILTERS.offset!;
    const total = data?.total || 0;
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
  }, [data?.total, filters.limit, filters.offset]);

  // Определение колонок таблицы
  const tableColumns = [
    { field: "first_name" as const, labelKey: "name", sortable: true },
    { field: undefined, labelKey: "surname", sortable: false },
    { field: "phone" as const, labelKey: "phone", sortable: true },
    { field: "role" as const, labelKey: "role", sortable: true },
    { field: undefined, labelKey: "status", sortable: false },
    { field: "created_at" as const, labelKey: "createdAt", sortable: true },
  ];

  // Открытие диалога добавления сотрудника
  const handleAddStaff = () => {
    addStaffDialog.onOpen();
  };

  return (
    <div className="flex flex-col md:p-4">
      {/* Фильтры */}
      <StaffFilters filters={filters} onFiltersChange={setFilters} />

      {/* Таблица */}
      <Card className="border-none">
        <CardHeader className="flex flex-row justify-between items-center px-6 py-2">
          <CardTitle>{t("tableTitle")}</CardTitle>

          <Button onClick={handleAddStaff}>
            <Plus />
            {t("addStaff")}
          </Button>
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
                    {!data?.employees || data.employees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={tableColumns.length}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.employees.map(employee => (
                        <StaffTableRow key={employee.phone} user={employee} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Пагинация */}
              {data && data.total > 0 && (
                <Pagination
                  paginationInfo={paginationInfo}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления сотрудника */}
      <AddStaffDialog
        open={addStaffDialog.isOpen}
        onOpenChange={open => {
          if (open) {
            addStaffDialog.onOpen();
          } else {
            addStaffDialog.onClose();
          }
        }}
      />
    </div>
  );
}
