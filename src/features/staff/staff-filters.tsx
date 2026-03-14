"use client";

import { useState } from "react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "@/src/entities";
import type { GetEmployeesParams } from "@/src/shared/services/employee-service";
import type { TUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useDebounceCallback } from "@/src/shared/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { DEFAULT_STAFF_FILTERS } from "./constants";

/**
 * Интерфейс для фильтров сотрудников
 */
export interface StaffFiltersProps {
  filters: GetEmployeesParams;
  onFiltersChange: (filters: GetEmployeesParams) => void;
}

/**
 * Компонент фильтров для таблицы сотрудников
 */
export function StaffFilters({ filters, onFiltersChange }: StaffFiltersProps) {
  const t = useTranslations("Staff.filters");
  const tRoles = useTranslations("Staff.roles");

  const [localLocationId, setLocalLocationId] = useState(
    filters.location_id || ""
  );
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  // Проверка наличия активных фильтров
  const hasActiveFilters = Boolean(
    filters.location_id ||
      (filters.role && filters.role.length > 0) ||
      (filters.search && filters.search.trim())
  );

  // Обработка изменения фильтров
  const handleFilterChange = <K extends keyof GetEmployeesParams>(
    key: K,
    value: GetEmployeesParams[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      offset: 0, // Сбрасываем пагинацию при изменении фильтров
    });
  };

  // Очистка всех фильтров
  const handleClearFilters = () => {
    onFiltersChange({
      ...DEFAULT_STAFF_FILTERS,
      location_id: undefined,
      role: undefined,
      search: undefined,
    });
    setLocalLocationId("");
    setLocalSearch("");
  };

  // Debounce для ID локации (применяется через 500мс после остановки ввода)
  useDebounceCallback(
    localLocationId,
    debouncedLocationId => {
      const locationIdValue = debouncedLocationId.trim();
      handleFilterChange("location_id", locationIdValue || undefined);
    },
    500
  );

  // Debounce для поиска (применяется через 500мс после остановки ввода)
  useDebounceCallback(
    localSearch,
    debouncedSearch => {
      const searchValue = debouncedSearch.trim();
      handleFilterChange("search", searchValue || undefined);
    },
    500
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Фильтр по UUID локации */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">
            {t("locationId")}
          </label>
          <Input
            placeholder={t("locationIdPlaceholder")}
            value={localLocationId}
            onChange={e => setLocalLocationId(e.target.value)}
          />
        </div>

        {/* Фильтр по ролям */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">{t("role")}</label>
          <Select
            value={filters.role?.[0] || "all"}
            onValueChange={value => {
              // Если выбрано "all" или пустое значение - убираем фильтр по роли
              handleFilterChange(
                "role",
                value && value !== "all" ? [value as TUserRole] : undefined
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("rolePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allRoles")}</SelectItem>
              <SelectItem value="owner">{tRoles("owner")}</SelectItem>
              <SelectItem value="manager">{tRoles("manager")}</SelectItem>
              <SelectItem value="staff">{tRoles("staff")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр по всем полям */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">
            {t("search")}
          </label>
          <Input
            placeholder={t("searchPlaceholder")}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Кнопка очистки фильтров */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            className="mb-0"
          >
            {t("clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
