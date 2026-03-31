"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import {
  useLocation,
  useLocations,
} from "@/src/shared/hooks/use-network-locations";
import { useSchedulePermissions } from "@/src/shared/hooks/use-schedule-permissions";
import type {
  ScheduleUserFlags,
  PointScheduleContext,
  ScheduleType,
} from "@/src/shared/types/schedule";
import { ScheduleScopeProvider } from "./schedule-scope-context";
import { ScheduleHeader } from "./schedule-header";
import { ScheduleContent } from "./schedule-content";
import {
  ScheduleCalendarSkeleton,
  ScheduleEditorSkeleton,
} from "./ui/schedule-skeleton";
import { ESubscriptionPlan } from "@/src/shared/types/user";

/**
 * Клиентская обёртка страницы графика: провайдер scope и права.
 * Берёт данные текущего пользователя и локации для определения schedule_type.
 * Для network плана — показывает Select локации в хедере.
 */
export function SchedulePageClient() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  /* Network plan: загружаем список локаций для Select. */
  const isNetworkPlan =
    user?.organization?.subscription?.plan === ESubscriptionPlan.NETWORK;
  const { data: locationsData, isLoading: isLocationsListLoading } =
    useLocations();

  /* Выбранная локация (для network — из Select, для остальных — user.location_id). */
  const [selectedLocationId, setSelectedLocationId] = useState<
    string | undefined
  >();

  /* Инициализация selectedLocationId когда user загрузился. */
  useEffect(() => {
    if (user?.location_id && !selectedLocationId) {
      setSelectedLocationId(user.location_id);
    }
  }, [user?.location_id, selectedLocationId]);

  /* Загружаем выбранную локацию для schedule_type. */
  const { data: location, isLoading: isLocationLoading } =
    useLocation(selectedLocationId);

  const isSoloPlan =
    user?.organization?.subscription?.plan === ESubscriptionPlan.SOLO;

  /* Маппинг permissions API → ScheduleUserFlags. */
  const userFlags: ScheduleUserFlags = {
    can_work: user?.permissions.can_provide_services ?? false,
    can_manage_point_schedule:
      user?.permissions.can_manage_location_schedule ?? false,
  };

  /* schedule_type из локации (fallback "mixed"). */
  const scheduleType: ScheduleType =
    (location?.schedule_type as ScheduleType) ?? "mixed";
  const pointContext: PointScheduleContext = {
    schedule_type: scheduleType,
  };

  const permissions = useSchedulePermissions({
    userFlags,
    pointContext,
    isSoloPlan,
  });

  /* Список локаций для Select (только network). */
  const locations = isNetworkPlan ? (locationsData?.locations ?? []) : [];

  /* Скелетон при загрузке. */
  const isLoading =
    isUserLoading ||
    isLocationLoading ||
    (isNetworkPlan && isLocationsListLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <ScheduleHeader />
        <div className="gap-4 p-4 grid grid-cols-1 md:grid-cols-[1fr_280px] items-start">
          <ScheduleCalendarSkeleton />
          <ScheduleEditorSkeleton />
        </div>
      </div>
    );
  }

  return (
    <ScheduleScopeProvider
      defaultScope={permissions.defaultScope}
      locationId={selectedLocationId}
      scheduleType={scheduleType}
    >
      <ScheduleHeader
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        showLocationSelect={isNetworkPlan && locations.length > 1}
      />
      <ScheduleContent />
    </ScheduleScopeProvider>
  );
}
