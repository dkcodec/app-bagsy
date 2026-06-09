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
import type { ISubscriptionLimit, TUserRole } from "@/src/shared/types/user";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { useDebounceCallback } from "@/src/shared/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

export interface StaffFiltersProps {
  filters: GetEmployeesParams;
  onFiltersChange: (filters: GetEmployeesParams) => void;
  onInviteClick: () => void;
  /** Лимиты подписки на сотрудников */
  employeeLimits?: ISubscriptionLimit;
}

/**
 * Панель фильтров: поиск, [точка (network)], роль, статус, кнопка приглашения
 */
export function StaffFilters({
  filters,
  onFiltersChange,
  onInviteClick,
  employeeLimits,
}: StaffFiltersProps) {
  const t = useTranslations("Staff");
  const tFilters = useTranslations("Staff.filters");
  const tRoles = useTranslations("Staff.roles");
  const router = useRouter();

  const { data: currentUser } = useCurrentUser();
  const isNetwork = currentUser?.organization?.subscription?.plan === "network";

  // Достигнут лимит сотрудников (max: null = безлимит)
  const isLimitReached =
    employeeLimits?.max != null
      ? employeeLimits.used >= employeeLimits.max
      : false;

  // Список локаций (только owner + network)
  const { data: locationsData } = useLocations();
  const locations = locationsData?.locations || [];

  const [localSearch, setLocalSearch] = useState(filters.search || "");

  // Обновление фильтра с сбросом пагинации
  const updateFilter = <K extends keyof GetEmployeesParams>(
    key: K,
    value: GetEmployeesParams[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value, offset: 0 });
  };

  // Debounce поиска (500мс)
  useDebounceCallback(
    localSearch,
    val => updateFilter("search", val.trim() || undefined),
    500
  );

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-3">
      {/* Поиск — на мобилке полная ширина */}
      <div className="relative w-full md:flex-1 md:min-w-[200px] md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={tFilters("searchByNameOrPhone")}
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Фильтр по точке — только network план */}
      {isNetwork && locations.length > 0 && (
        <Select
          value={filters.location_id || "all"}
          onValueChange={value =>
            updateFilter(
              "location_id",
              value && value !== "all" ? value : undefined
            )
          }
        >
          <SelectTrigger className="flex-1 md:flex-none md:w-[160px] h-9 text-sm">
            <SelectValue placeholder={tFilters("allLocations")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters("allLocations")}</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Фильтр по роли */}
      <Select
        value={filters.role?.[0] || "all"}
        onValueChange={value =>
          updateFilter(
            "role",
            value && value !== "all" ? [value as TUserRole] : undefined
          )
        }
      >
        <SelectTrigger className="flex-1 md:flex-none md:w-[140px] h-9 text-sm">
          <SelectValue placeholder={tFilters("allRoles")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{tFilters("allRoles")}</SelectItem>
          <SelectItem value="owner">{tRoles("owner")}</SelectItem>
          <SelectItem value="manager">{tRoles("manager")}</SelectItem>
          <SelectItem value="staff">{tRoles("staff")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Фильтр по статусу */}
      <Select
        value={
          filters.active === true
            ? "active"
            : filters.active === false
              ? "inactive"
              : "all"
        }
        onValueChange={value =>
          updateFilter(
            "active",
            value === "active" ? true : value === "inactive" ? false : undefined
          )
        }
      >
        <SelectTrigger className="flex-1 md:flex-none md:w-[140px] h-9 text-sm">
          <SelectValue placeholder={tFilters("allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{tFilters("allStatuses")}</SelectItem>
          <SelectItem value="active">{tFilters("active")}</SelectItem>
          <SelectItem value="inactive">{tFilters("inactive")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Кнопка приглашения — при лимите → на страницу подписки */}
      <Button
        onClick={
          isLimitReached
            ? () => router.push("/account?tab=subscription")
            : onInviteClick
        }
        size="sm"
        variant={isLimitReached ? "outline" : "default"}
        className="shrink-0"
      >
        <Plus className="size-4" />
        <span className="hidden md:inline">{t("invite")}</span>
      </Button>
    </div>
  );
}
