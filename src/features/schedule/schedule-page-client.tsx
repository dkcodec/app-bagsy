"use client";

import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useSchedulePermissions } from "@/src/shared/hooks/use-schedule-permissions";
import type {
  ScheduleUserFlags,
  PointScheduleContext,
} from "@/src/shared/types/schedule";
import { ScheduleScopeProvider } from "./schedule-scope-context";
import { ScheduleHeader } from "./schedule-header";
import { ScheduleContent } from "./schedule-content";

/**
 * Клиентская обёртка страницы графика: провайдер scope и права.
 * Берёт данные текущего пользователя через useCurrentUser.
 */
export function SchedulePageClient() {
  const { data: user, isLoading } = useCurrentUser();

  /* Маппинг permissions API → ScheduleUserFlags. */
  const userFlags: ScheduleUserFlags = {
    can_work: user?.permissions.can_provide_services ?? false,
    can_manage_point_schedule:
      user?.permissions.can_manage_location_schedule ?? false,
  };

  /* TODO: schedule_type пока "mixed" по умолчанию; заменить когда появится API локации. */
  const pointContext: PointScheduleContext = { schedule_type: "mixed" };

  const permissions = useSchedulePermissions({ userFlags, pointContext });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
