"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/src/entities";
import {
  useLocationServices,
  useServiceCategories,
} from "@/src/shared/hooks/use-services";
import { useLocation } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useServiceStaffMap } from "@/src/shared/hooks/user-staff";
import { useCalendarStore } from "@/src/features/calendar/calendar-context/store";
import { EUserRole, TUserRole } from "@/src/shared/types/user";

import { ErrorMessage } from "./components/error-message";
import { AddServiceDialog } from "./components/add-service-dialog";
import { ServiceList } from "./components/service-list";
import { useIsMobile } from "@/src/shared";

/**
 * Компонент страницы услуг — оркестратор.
 * locationId берётся из глобального calendar store (переключатель в сайдбаре).
 */
export function ServicesContent() {
  const t = useTranslations("Services");
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  // locationId из глобального стора (устанавливается в сайдбаре)
  const locationId = useCalendarStore(s => s.locationId);
  const setLocationId = useCalendarStore(s => s.setLocationId);

  // Для MANAGER: fallback на currentUser.location_id
  useEffect(() => {
    if (
      currentUser?.role === EUserRole.MANAGER &&
      currentUser.location_id &&
      !locationId
    ) {
      setLocationId(currentUser.location_id);
    }
  }, [currentUser, locationId, setLocationId]);

  // Данные услуг
  const { data, isLoading, error } = useLocationServices(locationId);

  // Категории услуг (нужны для группировки)
  const { data: locationData } = useLocation(locationId);
  const { data: categoriesData } = useServiceCategories(
    locationData?.category_id
  );

  const isStaff = currentUser?.role === EUserRole.STAFF;

  const staffMapRoles: TUserRole[] = isStaff
    ? [EUserRole.STAFF]
    : [EUserRole.STAFF, EUserRole.MANAGER, EUserRole.OWNER];

  // Карта serviceId → сотрудники (для аватарок в таблице и drawer)
  const { staffMap } = useServiceStaffMap(locationId, staffMapRoles);

  if (error) return <ErrorMessage error={error} />;

  const services = data?.services || [];
  const categories = categoriesData?.categories || [];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Заголовок: кол-во + кнопка */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-end gap-3">
          {!isLoading && services.length > 0 && (
            <span className="text-xs text-muted-foreground pb-3">
              {t("serviceCount", { count: services.length })}
            </span>
          )}
        </div>

        {/* Кнопка добавления скрыта для staff */}
        {!isStaff &&
          (isMobile ? (
            <Button
              size="icon"
              onClick={() => setIsDialogOpen(true)}
              disabled={!locationId}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={!locationId}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("addService")}
            </Button>
          ))}
      </div>

      {/* Список услуг */}
      <ServiceList
        services={services}
        categories={categories}
        locationId={locationId || ""}
        isLoading={isLoading}
        staffMap={staffMap}
      />

      {/* Диалог добавления */}
      <AddServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        locationId={locationId}
      />
    </div>
  );
}
