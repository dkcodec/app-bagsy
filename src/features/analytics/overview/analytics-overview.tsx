"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/src/entities";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useOverviewAnalytics } from "@/src/shared/hooks/use-analytics";
import { parsePeriodFromSearch } from "../utils/period";
import { getAnalyticsAccess } from "../utils/access";
import { KpiGrid } from "./kpi-grid";
import { RevenueChart } from "./revenue-chart";
import { TopEmployeesCard } from "./top-employees-card";
import { TopServicesCard } from "./top-services-card";
import { FunnelCard } from "./funnel-card";
import { LoadHeatmapCard } from "./load-heatmap-card";
import { InsightsCard } from "./insights-card";

/**
 * Главная страница /analytics (для Manager/Owner).
 * Solo Owner и Staff сюда не попадают — на page.tsx стоит редирект на /me.
 */
export function AnalyticsOverview() {
  const searchParams = useSearchParams();
  // Полные параметры аналитики из URL — включая compare_from/compare_to
  // для явной передачи периода сравнения бэку/мокам
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const { data: user } = useCurrentUser();
  const access = getAnalyticsAccess(user);

  // Solo не должен видеть Top-мастеров (он один в системе)
  const isSolo = access.plan === "solo";

  const { data, isLoading } = useOverviewAnalytics(params);

  if (isLoading || !data) return <OverviewSkeleton />;

  return (
    <div className="flex flex-col gap-4 p-4">
      <KpiGrid kpi={data.kpi} />

      {data.insights.length > 0 && <InsightsCard insights={data.insights} />}

      <RevenueChart data={data.revenue_by_day} />

      <div className="grid gap-4 lg:grid-cols-2">
        {!isSolo && <TopEmployeesCard items={data.top_employees} />}
        <TopServicesCard items={data.top_services} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelCard stages={data.funnel} />
        <LoadHeatmapCard cells={data.heatmap} />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[280px] rounded-xl" />
        <Skeleton className="h-[280px] rounded-xl" />
      </div>
    </div>
  );
}
