"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import {
  useLocation,
  useLocations,
} from "@/src/shared/hooks/use-network-locations";
import { useCalendarStore } from "@/src/features/calendar/calendar-context/store";
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

  /* Выбранная локация из calendar store (устанавливается в сайдбаре). */
  const selectedLocationId = useCalendarStore(s => s.locationId);
  const setLocationId = useCalendarStore(s => s.setLocationId);

  /* Для не-network: инициализируем locationId из user.location_id. */
  useEffect(() => {
    if (user?.location_id && !selectedLocationId) {
      setLocationId(user.location_id);
    }
  }, [user?.location_id, selectedLocationId, setLocationId]);

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
      <ScheduleHeader />
      <ScheduleContent />
    </ScheduleScopeProvider>
  );
}
