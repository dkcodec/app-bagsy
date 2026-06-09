"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Skeleton } from "@/src/entities";
import { useLocationAnalytics } from "@/src/shared/hooks/use-analytics";
import { parsePeriodFromSearch } from "../utils/period";
import { KpiGrid } from "../overview/kpi-grid";
import { RevenueChart } from "../overview/revenue-chart";
import { TopEmployeesCard } from "../overview/top-employees-card";
import { TopServicesCard } from "../overview/top-services-card";
import { FunnelCard } from "../overview/funnel-card";
import { LoadHeatmapCard } from "../overview/load-heatmap-card";
import { InsightsCard } from "../overview/insights-card";

/**
 * Drill-down по локации для Network Owner (/analytics/locations/[id]).
 * По структуре идентичен Overview, но скоупом одна точка.
 */
export function LocationDetail({ locationId }: { locationId: string }) {
  const t = useTranslations("Analytics");
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { data, isLoading } = useLocationAnalytics(locationId, params);

  const qs = searchParams.toString();
  const backHref = `/analytics${qs ? `?${qs}` : ""}`;

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ChevronLeft className="size-4" />
            {t("tabs.overview")}
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <h2 className="text-lg font-semibold">
          {t("locations.title", { id: locationId.slice(0, 8) })}
        </h2>
      </div>

      <KpiGrid kpi={data.kpi} />
      {data.insights.length > 0 && <InsightsCard insights={data.insights} />}
      <RevenueChart data={data.revenue_by_day} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopEmployeesCard items={data.top_employees} />
        <TopServicesCard items={data.top_services} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelCard stages={data.funnel} />
        <LoadHeatmapCard cells={data.heatmap} />
      </div>
    </div>
  );
}
