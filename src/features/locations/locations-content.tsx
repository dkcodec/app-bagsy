"use client";

import { useState } from "react";
import { useLocationsPage } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { Card, CardContent, Skeleton, Button } from "@/src/entities";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ErrorMessage } from "./components/error-message";
import { LocationDetailView } from "./components/location-detail-view";
import { LocationNetworkView } from "./components/location-network-view";
import { AddPointDialog } from "./components/add-location-dialog";

/**
 * Основной контент страницы локаций
 * Solo (1 локация) → детальная карточка
 * Network (>1) → сетка карточек
 * Empty → приглашение создать
 */
export function LocationsContent() {
  const t = useTranslations("Locations");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, error } = useLocationsPage();

  // Загрузка — скелетон сетки карточек
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <div className="flex flex-col md:p-4">
        <ErrorMessage error={error} />
      </div>
    );
  }

  const locations = data?.locations ?? [];
  const total = data?.total ?? 0;

  /* Проверяем лимит локаций по подписке */
  const locLimit = currentUser?.organization.subscription.limits.locations;
  const canAddLocation =
    (currentUser?.role === EUserRole.OWNER ||
      currentUser?.role === EUserRole.MANAGER) &&
    (!locLimit || locLimit.max === null || locLimit.used < locLimit.max);

  // Пустое состояние — предложение создать локацию
  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-muted-foreground mb-4">{t("noData")}</p>
        {canAddLocation && (
          <>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t("addPoint")}
            </Button>
            <AddPointDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </>
        )}
      </div>
    );
  }

  // Solo mode: единственная локация → детальный вид
  if (total === 1) {
    return (
      <>
        <LocationDetailView
          location={locations[0]}
          onAddLocation={
            canAddLocation ? () => setIsDialogOpen(true) : undefined
          }
        />
        <AddPointDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </>
    );
  }

  // Network mode: несколько локаций → сетка карточек
  return (
    <>
      <LocationNetworkView
        locations={locations}
        total={total}
        canAddLocation={canAddLocation}
        onAddLocation={() => setIsDialogOpen(true)}
      />
      <AddPointDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
