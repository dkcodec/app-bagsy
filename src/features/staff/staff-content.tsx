"use client";

import { useState, useMemo } from "react";
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";
import type { IEmployeeDto } from "@/src/shared/types/user";
import { Skeleton } from "@/src/entities";
import { StaffFilters } from "./staff-filters";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { Pagination, type PaginationInfo } from "./components/pagination";
import { StaffTableRow } from "./components/table-row";
import { SortIcon } from "./components/sort-icon";
import { DEFAULT_STAFF_FILTERS } from "./constants";
import { AddStaffDialog } from "./add-staff-dialog";
import { EmployeeDrawer } from "./components/drawer";
import { useDisclosure } from "@/src/shared/hooks";

/**
 * Компонент таблицы сотрудников с фильтрацией, сортировкой, пагинацией и drawer
 */
export function StaffContent() {
  const t = useTranslations("Staff");

  // Фильтры
  const [filters, setFilters] = useState<GetEmployeesParams>(
    DEFAULT_STAFF_FILTERS
  );

  // Диалог добавления + drawer сотрудника
  const addStaffDialog = useDisclosure();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Данные
  const { data, isLoading, error } = useGetEmployees(filters);
  const { data: currentUser } = useCurrentUser();

  // Лимиты подписки
  const employeeLimits =
    currentUser?.organization?.subscription?.limits?.employees;

  // Сортировка
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

  // Пагинация
  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const paginationInfo = useMemo<PaginationInfo>(() => {
    const limit = filters.limit || DEFAULT_STAFF_FILTERS.limit!;
    const offset = filters.offset || DEFAULT_STAFF_FILTERS.offset!;
    const total = data?.total || 0;
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    return {
      currentPage,
      totalPages,
      hasNext: offset + limit < total,
      hasPrev: offset > 0,
      total,
      limit,
      offset,
    };
  }, [data?.total, filters.limit, filters.offset]);

  // Свежий объект сотрудника из кэша (обновляется при optimistic update)
  const selectedEmployee = useMemo(
    () => data?.employees?.find(e => e.id === selectedEmployeeId) ?? null,
    [data?.employees, selectedEmployeeId]
  );

  // Клик по строке — открыть drawer
  const handleRowClick = (employee: IEmployeeDto) => {
    setSelectedEmployeeId(employee.id);
    setDrawerOpen(true);
  };

  // Колонки для сортировки
  const sortableColumns = [
    { field: "first_name" as const, labelKey: "name" },
    { field: "phone" as const, labelKey: "phone", hiddenMobile: true },
    { field: "role" as const, labelKey: "role", hiddenMobile: true },
  ];

  return (
    <div className="flex flex-col md:p-4">
      {/* Фильтры + кнопка приглашения */}
      <StaffFilters
        filters={filters}
        onFiltersChange={setFilters}
        onInviteClick={addStaffDialog.onOpen}
        employeeLimits={employeeLimits}
      />

      {/* Ошибка загрузки */}
      {error && <ErrorMessage error={error} />}

      {/* Таблица */}
      {isLoading ? (
        <div className="border rounded-lg overflow-hidden mx-3 md:mx-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b last:border-b-0">
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden mx-3 md:mx-0">
            {/* Заголовки колонок — только десктоп */}
            <div className="hidden md:grid md:grid-cols-[1fr_120px_100px_90px_32px] gap-3 items-center px-4 py-2 border-b bg-muted/30">
              {sortableColumns.map(col => (
                <span
                  key={col.field}
                  className={`text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center ${col.hiddenMobile ? "hidden md:flex" : ""}`}
                  onClick={() => handleSort(col.field)}
                >
                  {t(col.labelKey)}
                  <SortIcon
                    field={col.field}
                    currentField={filters.order_by}
                    sortOrder={filters.sort_order}
                  />
                </span>
              ))}
              {/* Статус — не сортируемый */}
              <span className="text-xs text-muted-foreground hidden md:inline">
                {t("status")}
              </span>
              <span />
            </div>

            {/* Строки сотрудников */}
            {!data?.employees || data.employees.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
              data.employees.map(employee => (
                <StaffTableRow
                  key={employee.id}
                  user={employee}
                  onClick={() => handleRowClick(employee)}
                  isSelected={selectedEmployeeId === employee.id}
                />
              ))
            )}
          </div>

          {/* Пагинация + лимит сотрудников */}
          {data && data.total > 0 && (
            <Pagination
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              employeeLimits={employeeLimits}
            />
          )}
        </>
      )}

      {/* Drawer сотрудника */}
      <EmployeeDrawer
        employee={selectedEmployee}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Диалог добавления сотрудника */}
      <AddStaffDialog
        open={addStaffDialog.isOpen}
        onOpenChange={open => {
          if (open) addStaffDialog.onOpen();
          else addStaffDialog.onClose();
        }}
      />
    </div>
  );
}
