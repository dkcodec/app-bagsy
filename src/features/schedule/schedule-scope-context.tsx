"use client";

import { createContext, useContext, useState, useMemo } from "react";
import type { ScheduleScope } from "@/src/shared/types/schedule";

type ScheduleScopeContextValue = {
  activeScope: ScheduleScope;
  setActiveScope: (s: ScheduleScope) => void;
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
  children,
}: {
  defaultScope: ScheduleScope;
  children: React.ReactNode;
}) {
  const [activeScope, setActiveScope] = useState<ScheduleScope>(defaultScope);
  const value = useMemo(() => ({ activeScope, setActiveScope }), [activeScope]);
  return (
    <ScheduleScopeContext.Provider value={value}>
      {children}
    </ScheduleScopeContext.Provider>
  );
}
