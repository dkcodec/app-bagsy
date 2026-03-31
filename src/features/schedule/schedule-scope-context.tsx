"use client";

import { createContext, useContext, useState, useMemo } from "react";
import type { ScheduleScope, ScheduleType } from "@/src/shared/types/schedule";

type ScheduleScopeContextValue = {
  activeScope: ScheduleScope;
  setActiveScope: (s: ScheduleScope) => void;
  /** ID выбранной локации (для network — переключается селектом в header). */
  locationId: string | undefined;
  /** Тип расписания выбранной локации. */
  scheduleType: ScheduleType;
};

const ScheduleScopeContext = createContext<ScheduleScopeContextValue | null>(
  null
);

export function useScheduleScope(): ScheduleScopeContextValue {
  const ctx = useContext(ScheduleScopeContext);
  if (!ctx)
    throw new Error(
      "useScheduleScope must be used within ScheduleScopeProvider"
    );
  return ctx;
}

export function ScheduleScopeProvider({
  defaultScope,
  locationId,
  scheduleType,
  children,
}: {
  defaultScope: ScheduleScope;
  /** ID локации — управляется родителем (schedule-page-client). */
  locationId?: string;
  scheduleType: ScheduleType;
  children: React.ReactNode;
}) {
  const [activeScope, setActiveScope] = useState<ScheduleScope>(defaultScope);

  const value = useMemo(
    () => ({ activeScope, setActiveScope, locationId, scheduleType }),
    [activeScope, locationId, scheduleType]
  );

  return (
    <ScheduleScopeContext.Provider value={value}>
      {children}
    </ScheduleScopeContext.Provider>
  );
}
