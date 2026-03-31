"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/src/entities";
import {
  useLocationServices,
  useServiceCategories,
} from "@/src/shared/hooks/use-services";
import {
  useLocations,
  useLocation,
} from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useServiceStaffMap } from "@/src/shared/hooks/user-staff";
import { EUserRole } from "@/src/shared/types/user";

import { ErrorMessage } from "./components/error-message";
import { LocationSelect } from "./components/location-select";
import { AddServiceDialog } from "./components/add-service-dialog";
import { ServiceList } from "./components/service-list";
import { useIsMobile } from "@/src/shared";

/**
 * Компонент страницы услуг — оркестратор
 */
export function ServicesContent() {
  const t = useTranslations("Services");
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  // Показываем селектор локации только для network-плана с ролью Owner
  const isNetwork = currentUser?.organization?.subscription?.plan === "network";
  const isOwner = currentUser?.role === EUserRole.OWNER;
  const showLocationSelect = isOwner && isNetwork;

  // Локация из URL query (?location=uuid)
  const locationFromUrl = searchParams.get("location") || undefined;

  // Загружаем локации для Owner
  const { data: locationsData } = useLocations();

  // Вычисляем дефолтный locationId
  const defaultLocationId = useMemo(() => {
    if (currentUser?.role === EUserRole.MANAGER) {
      return currentUser.location_id;
    }
    if (isOwner && locationsData?.locations?.length) {
      return locationsData.locations[0].id;
    }
    return undefined;
  }, [currentUser, locationsData, isOwner]);

  // Для network: берём из URL, иначе дефолт
  const locationId = useMemo(() => {
    if (!showLocationSelect) return defaultLocationId;
    // Проверяем что locationFromUrl валидный (есть в списке)
    if (
      locationFromUrl &&
      locationsData?.locations?.some(l => l.id === locationFromUrl)
    ) {
      return locationFromUrl;
    }
    return defaultLocationId;
  }, [showLocationSelect, defaultLocationId, locationFromUrl, locationsData]);

  // Обновить URL при смене локации
  const handleLocationChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("location", value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Данные услуг
  const { data, isLoading, error } = useLocationServices(locationId);

  // Категории услуг (нужны для группировки)
  const { data: locationData } = useLocation(locationId);
  const { data: categoriesData } = useServiceCategories(
    locationData?.category_id
  );

  // Карта serviceId → сотрудники (для аватарок в таблице и drawer)
  const { staffMap } = useServiceStaffMap(locationId);

  if (error) return <ErrorMessage error={error} />;

  const services = data?.services || [];
  const categories = categoriesData?.categories || [];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Заголовок: селектор + кол-во + кнопка */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-end gap-3">
          {showLocationSelect && (
            <LocationSelect
              value={locationId}
              onValueChange={handleLocationChange}
            />
          )}
          {!isLoading && services.length > 0 && (
            <span className="text-xs text-muted-foreground pb-3">
              {t("serviceCount", { count: services.length })}
            </span>
          )}
        </div>

        {isMobile ? (
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
        )}
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
