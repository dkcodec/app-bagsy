"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import {
  AnalyticsGuard,
  AnalyticsOverview,
  getAnalyticsAccess,
} from "@/src/features/analytics";
import { useCurrentUser } from "@/src/shared/hooks/use-users";

/**
 * /analytics — корневой роут.
 * Smart redirect:
 *   - Staff и Solo Owner → /analytics/me
 *   - остальные → рендерится Overview
 */
export default function AnalyticsRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading || !user) return;
    const access = getAnalyticsAccess(user);
    if (access.defaultTab === "me") {
      const qs = searchParams.toString();
      router.replace(`/analytics/me${qs ? `?${qs}` : ""}`);
    }
  }, [user, isLoading, router, searchParams]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="overview">
        <AnalyticsOverview />
      </AnalyticsGuard>
    </Suspense>
  );
}
