"use client";
import { useTranslations } from "next-intl";
import type { IOverviewDto } from "@/src/shared/types/analytics";
import { formatTenge, formatPercent } from "@/src/shared/utils";
import { KpiCard } from "../components/kpi-card";
import { StaggerGrid } from "../components/stagger-grid";

/**
 * Сетка KPI-карточек.
 * Используется на /analytics и /analytics/me (передаём свой IOverviewDto["kpi"]).
 */
export function KpiGrid({ kpi }: { kpi: IOverviewDto["kpi"] }) {
  const t = useTranslations("Analytics");

  return (
    <StaggerGrid className="grid gap-3 grid-cols-2 lg:grid-cols-6">
      <KpiCard
        label={t("kpi.revenue")}
        value={kpi.revenue.value}
        deltaPercent={kpi.revenue.delta_percent}
        format={formatTenge}
      />
      <KpiCard
        label={t("kpi.bookings")}
        value={kpi.bookings.value}
        deltaPercent={kpi.bookings.delta_percent}
      />
      <KpiCard
        label={t("kpi.clients")}
        value={kpi.clients.value}
        deltaPercent={kpi.clients.delta_percent}
      />
      <KpiCard
        label={t("kpi.avgCheck")}
        value={kpi.avg_check.value}
        deltaPercent={kpi.avg_check.delta_percent}
        format={formatTenge}
      />
      <KpiCard
        label={t("kpi.load")}
        value={kpi.load_percent.value}
        deltaPercent={kpi.load_percent.delta_percent}
        format={n => formatPercent(n)}
      />
      <KpiCard
        label={t("kpi.cancellations")}
        value={kpi.cancellation_percent.value}
        deltaPercent={kpi.cancellation_percent.delta_percent}
        format={n => formatPercent(n)}
        invertDelta // меньше отмен = лучше
      />
    </StaggerGrid>
  );
}
