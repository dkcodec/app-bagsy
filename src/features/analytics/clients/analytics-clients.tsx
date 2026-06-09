"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/src/entities";
import { useClientsAnalytics } from "@/src/shared/hooks/use-analytics";
import { parsePeriodFromSearch } from "../utils/period";
import { KpiCard } from "../components/kpi-card";
import { StaggerGrid } from "../components/stagger-grid";
import { SegmentsChart } from "./segments-chart";
import { RetentionCard } from "./retention-card";
import { CohortTable } from "./cohort-table";

/**
 * Раздел "Клиенты". Помечен Beta — клиенты как сущности в API ещё нет,
 * данные считаются по phone из appointments (см. mocks).
 */
export function AnalyticsClients() {
  const t = useTranslations("Analytics");
  const tClients = useTranslations("Analytics.clients");
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { data, isLoading } = useClientsAnalytics(params);

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{t("tabs.clients")}</h2>
        <Badge variant="secondary">{tClients("beta")}</Badge>
      </div>

      <StaggerGrid className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={tClients("totalInBase")}
          value={data.kpi.total.value}
          deltaPercent={data.kpi.total.delta_percent}
        />
        <KpiCard
          label={tClients("new")}
          value={data.kpi.new.value}
          deltaPercent={data.kpi.new.delta_percent}
        />
        <KpiCard
          label={tClients("returning")}
          value={data.kpi.returning.value}
          deltaPercent={data.kpi.returning.delta_percent}
        />
        <KpiCard
          label={tClients("lost")}
          value={data.kpi.lost.value}
          deltaPercent={data.kpi.lost.delta_percent}
          invertDelta // меньше потерянных = лучше
        />
      </StaggerGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SegmentsChart segments={data.segments} />
        <RetentionCard retention={data.retention} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tClients("cohorts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CohortTable cohorts={data.cohorts} />
        </CardContent>
      </Card>
    </div>
  );
}
