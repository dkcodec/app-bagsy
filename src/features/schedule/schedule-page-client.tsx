"use client";

import { useSchedulePermissions } from "@/src/shared/hooks/use-schedule-permissions";
import { ScheduleScopeProvider } from "./schedule-scope-context";
import { ScheduleHeader } from "./schedule-header";
import { ScheduleContent } from "./schedule-content";

/** Мок: когда с API появятся can_work, can_manage_point_schedule и schedule_type точки — подставить данные из useCurrentUser и точки. */
const MOCK_USER_FLAGS = { can_work: true, can_manage_point_schedule: true };
const MOCK_POINT_CONTEXT = { schedule_type: "mixed" as const };

/**
 * Клиентская обёртка страницы графика: провайдер scope и права.
 */
export function SchedulePageClient() {
  const permissions = useSchedulePermissions({
    userFlags: MOCK_USER_FLAGS,
    pointContext: MOCK_POINT_CONTEXT,
  });

  return (
    <ScheduleScopeProvider defaultScope={permissions.defaultScope}>
      <ScheduleHeader />
      <ScheduleContent />
    </ScheduleScopeProvider>
  );
}
