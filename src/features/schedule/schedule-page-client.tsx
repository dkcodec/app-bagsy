"use client";

import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useLocation } from "@/src/shared/hooks/use-network-locations";
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

/**
 * Клиентская обёртка страницы графика: провайдер scope и права.
 * Берёт данные текущего пользователя и локации для определения schedule_type.
 */
export function SchedulePageClient() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  /* Загружаем локацию для schedule_type. */
  const { data: location, isLoading: isLocationLoading } = useLocation(
    user?.location_id
  );

  /* Маппинг permissions API → ScheduleUserFlags. */
  const userFlags: ScheduleUserFlags = {
    can_work: user?.permissions.can_provide_services ?? false,
    can_manage_point_schedule:
      user?.permissions.can_manage_location_schedule ?? false,
  };

  /* schedule_type из локации (fallback "mixed"). */
  const pointContext: PointScheduleContext = {
    schedule_type: (location?.schedule_type as ScheduleType) ?? "mixed",
  };

  /* Solo plan: owner = единственный сотрудник. */
  const isSoloPlan = user?.organization?.subscription?.plan === "solo";

  const permissions = useSchedulePermissions({
    userFlags,
    pointContext,
    isSoloPlan,
  });

  /* Скелетон при загрузке. */
  if (isUserLoading || isLocationLoading) {
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
    <ScheduleScopeProvider defaultScope={permissions.defaultScope}>
      <ScheduleHeader />
      <ScheduleContent />
    </ScheduleScopeProvider>
  );
}
