import { Suspense } from "react";
import { Loader } from "lucide-react";
import { AnalyticsGuard, LocationDetail } from "@/src/features/analytics";

/**
 * /analytics/locations/[locationId] — drill-down по локации.
 * Доступ только Network Owner (guard "locations").
 */
export default async function LocationAnalyticsPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="locations">
        <LocationDetail locationId={locationId} />
      </AnalyticsGuard>
    </Suspense>
  );
}
