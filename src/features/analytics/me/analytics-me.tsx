"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/src/entities";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useMyAnalytics } from "@/src/shared/hooks/use-analytics";
import { parsePeriodFromSearch } from "../utils/period";
import { KpiGrid } from "../overview/kpi-grid";
import { RevenueChart } from "../overview/revenue-chart";
import { TopServicesCard } from "../overview/top-services-card";
import { LoadHeatmapCard } from "../overview/load-heatmap-card";
import { InsightBanner } from "../components/insight-banner";

/**
 * Личная аналитика — для Staff и Solo Owner.
 * Без топ-мастеров, без финансов организации.
 */
export function AnalyticsMe() {
  const t = useTranslations("Analytics");
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const { data: user } = useCurrentUser();
  const { data, isLoading } = useMyAnalytics(params, user?.id);

  if (isLoading || !data) return <MeSkeleton />;

  return (
    <div className="flex flex-col gap-4 p-4">
      {user?.role === "staff" && (
        <InsightBanner level="info">{t("staffNotice")}</InsightBanner>
      )}

      <KpiGrid kpi={data.kpi} />

      <RevenueChart data={data.revenue_by_day} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopServicesCard items={data.top_services} />
        <ClientsBreakdownCard
          newCount={data.clients_breakdown.new}
          returningCount={data.clients_breakdown.returning}
        />
      </div>

      <LoadHeatmapCard cells={data.heatmap} />
    </div>
  );
}

/** Простой разрез "новые vs повторные клиенты". */
function ClientsBreakdownCard({
  newCount,
  returningCount,
}: {
  newCount: number;
  returningCount: number;
}) {
  const t = useTranslations("Analytics");
  const total = newCount + returningCount;
  const newShare = total ? newCount / total : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("clients.breakdownTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-stretch h-12 rounded-md overflow-hidden">
          <div
            className="bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground motion-safe:transition-[width] motion-safe:duration-700"
            style={{ width: `${newShare * 100}%` }}
          >
            {newCount > 0 && newCount}
          </div>
          <div
            className="bg-muted flex items-center justify-center text-xs font-medium motion-safe:transition-[width] motion-safe:duration-700"
            style={{ width: `${(1 - newShare) * 100}%` }}
          >
            {returningCount > 0 && returningCount}
          </div>
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>
            <span className="inline-block size-2 rounded-sm bg-accent mr-1.5" />
            {t("clients.new")}: {newCount}
          </span>
          <span>
            <span className="inline-block size-2 rounded-sm bg-muted-foreground/50 mr-1.5" />
            {t("clients.returning")}: {returningCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function MeSkeleton() {
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
