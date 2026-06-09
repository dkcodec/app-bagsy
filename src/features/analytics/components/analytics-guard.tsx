"use client";
import type { ReactNode } from "react";
import { Loader } from "lucide-react";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { canAccessTab, getAnalyticsAccess } from "../utils/access";
import type { TAnalyticsTab } from "../constants";
import { AccessDenied } from "../access-denied";

/**
 * Гард доступа к табу аналитики.
 * - Пока загружаемся — крутилка.
 * - Если нет прав — AccessDenied.
 * - Иначе — children.
 */
export function AnalyticsGuard({
  requires,
  children,
}: {
  requires: TAnalyticsTab;
  children: ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const access = getAnalyticsAccess(user);
  if (!canAccessTab(access, requires)) return <AccessDenied />;

  return <>{children}</>;
}
