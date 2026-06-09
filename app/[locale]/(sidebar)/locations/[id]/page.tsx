"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, Skeleton } from "@/src/entities";
import { LocationsHeader } from "@/src/features/locations";
import { LocationDetailView } from "@/src/features/locations/components/location-detail-view";
import { useLocation } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";

/**
 * Скелетон для детального вида локации
 */
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4 mx-auto w-full">
      {/* Back button */}
      <Skeleton className="h-8 w-32" />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      {/* Map */}
      <Skeleton className="h-[200px] rounded-lg" />
      {/* Working hours */}
      <div className="space-y-1">
        <Skeleton className="h-5 w-28 mb-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      {/* Booking link */}
      <Skeleton className="h-20 rounded-lg" />
    </div>
  );
}

/**
 * Страница детального просмотра локации
 * Sub-route: /locations/[id]
 */
export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Locations");
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: location, isLoading, error } = useLocation(id);

  // Загрузка — скелетон
  if (isLoading || userLoading) {
    return (
      <>
        <LocationsHeader />
        <DetailSkeleton />
      </>
    );
  }

  // Проверка доступа (Owner / Manager)
  const hasAccess =
    currentUser &&
    (currentUser.role === EUserRole.OWNER ||
      currentUser.role === EUserRole.MANAGER);

  if (!hasAccess) {
    return (
      <>
        <LocationsHeader />
        <div className="flex flex-col md:p-4">
          <Card className="border-none">
            <CardContent className="p-6 text-center">
              <p className="font-semibold mb-2 text-destructive">
                {t("accessDenied")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("accessDeniedDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Ошибка загрузки
  if (error || !location) {
    return (
      <>
        <LocationsHeader />
        <div className="flex flex-col md:p-4">
          <Card className="border-none">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("errorLoading")}
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <LocationsHeader />
      <LocationDetailView location={location} showBack />
    </>
  );
}
