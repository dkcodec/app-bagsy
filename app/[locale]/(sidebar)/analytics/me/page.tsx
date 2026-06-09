import { Suspense } from "react";
import { Loader } from "lucide-react";
import { AnalyticsGuard, AnalyticsMe } from "@/src/features/analytics";

/** /analytics/me — личная аналитика; доступно всем ролям. */
export default function AnalyticsMePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="me">
        <AnalyticsMe />
      </AnalyticsGuard>
    </Suspense>
  );
}
