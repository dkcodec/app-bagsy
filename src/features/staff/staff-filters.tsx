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
import { GetStaffParams } from "@/src/shared/services/staff-service";
import { EUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useDebounceCallback } from "@/src/shared/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { DEFAULT_STAFF_FILTERS } from "./constants";

/**
 * Интерфейс для фильтров сотрудников
 */
export interface StaffFiltersProps {
  filters: GetStaffParams;
  onFiltersChange: (filters: GetStaffParams) => void;
}

/**
 * Компонент фильтров для таблицы сотрудников
 */
export function StaffFilters({ filters, onFiltersChange }: StaffFiltersProps) {
  const t = useTranslations("Staff.filters");
  const tRoles = useTranslations("Staff.roles");
  const { data: user } = useCurrentUser();

  const [localPointCode, setLocalPointCode] = useState(
    filters.point_code || ""
  );
  const [localNetworkCode, setLocalNetworkCode] = useState(
    filters.network_code || ""
  );
  const [localPhone, setLocalPhone] = useState(filters.phone || "");

  // Проверка наличия активных фильтров
  const hasActiveFilters = Boolean(
    filters.point_code ||
      filters.network_code ||
      (filters.role && filters.role.length > 0) ||
      (filters.phone && filters.phone.trim())
  );

  // Обработка изменения фильтров
  const handleFilterChange = (key: keyof GetStaffParams, value: any) => {
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
      point_code: undefined,
      network_code: undefined,
      role: undefined,
      phone: undefined,
    });
    setLocalPointCode("");
    setLocalNetworkCode("");
    setLocalPhone("");
  };

  // Debounce для кода точки (применяется через 500мс после остановки ввода)
  useDebounceCallback(
    localPointCode,
    debouncedPointCode => {
      const pointCodeValue = debouncedPointCode.trim();
      handleFilterChange("point_code", pointCodeValue || undefined);
    },
    500
  );

  // Debounce для телефона (применяется через 500мс после остановки ввода)
  useDebounceCallback(
    localPhone,
    debouncedPhone => {
      const phoneValue = debouncedPhone.trim();
      handleFilterChange("phone", phoneValue || undefined);
    },
    500
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Фильтр по коду точки */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">
            {t("pointCode")}
          </label>
          <Input
            placeholder={t("pointCodePlaceholder")}
            value={localPointCode}
            onChange={e => setLocalPointCode(e.target.value)}
          />
        </div>

        {/* Фильтр по коду сети */}
        {user?.role === EUserRole.ADMIN && (
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1 block">
              {t("networkCode")}
            </label>
            <Input
              placeholder={t("networkCodePlaceholder")}
              value={localNetworkCode}
              onChange={e => setLocalNetworkCode(e.target.value)}
            />
          </div>
        )}

        {/* Фильтр по ролям */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">{t("role")}</label>
          <Select
            value={filters.role?.[0] || "all"}
            onValueChange={value => {
              // Если выбрано "all" или пустое значение - убираем фильтр по роли
              handleFilterChange(
                "role",
                value && value !== "all" ? [value] : undefined
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("rolePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allRoles")}</SelectItem>
              <SelectItem value="staff">{tRoles("staff")}</SelectItem>
              <SelectItem value="manager">{tRoles("manager")}</SelectItem>
              <SelectItem value="net_manager">
                {tRoles("net_manager")}
              </SelectItem>
              <SelectItem value="self_owner">{tRoles("self_owner")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Фильтр по телефону */}
        <div className="flex-1 min-w-[150px]">
          <label className="text-sm font-medium mb-1 block">{t("phone")}</label>
          <Input
            placeholder={t("phonePlaceholder")}
            value={localPhone}
            onChange={e => setLocalPhone(e.target.value)}
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
