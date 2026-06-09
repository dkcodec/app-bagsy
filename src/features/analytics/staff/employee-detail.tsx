"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/src/entities";
import { useEmployeeAnalytics } from "@/src/shared/hooks/use-analytics";
import { parsePeriodFromSearch } from "../utils/period";
import { KpiGrid } from "../overview/kpi-grid";
import { RevenueChart } from "../overview/revenue-chart";
import { TopServicesCard } from "../overview/top-services-card";

/**
 * Drill-down карточка по конкретному мастеру (/analytics/staff/[employeeId]).
 */
export function EmployeeDetail({ employeeId }: { employeeId: string }) {
  const t = useTranslations("Analytics");
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { data, isLoading } = useEmployeeAnalytics(employeeId, params);

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-xl" />
      </div>
    );
  }

  const qs = searchParams.toString();
  const backHref = `/analytics/staff${qs ? `?${qs}` : ""}`;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ChevronLeft className="size-4" />
            {t("tabs.staff")}
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <h2 className="text-lg font-semibold">{data.employee.full_name}</h2>
      </div>

      <KpiGrid kpi={data.kpi} />
      <RevenueChart data={data.revenue_by_day} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopServicesCard items={data.top_services} />
        <HourlyLoadCard hours={data.hourly_load} />
      </div>
    </div>
  );
}

/** Рабочие часы: фикс 9..21, отсутствующие у мастера часы дорисовываются пустыми. */
const HOURLY_LOAD_HOURS = Array.from({ length: 13 }, (_, i) => 9 + i);

/**
 * Бар-чарт нагрузки по часам — без recharts ради скорости.
 * Бэк отдаёт только часы записей мастера; недостающие дорисовываем как пустые
 * столбики, чтобы у пользователя был полный обзор рабочего дня.
 */
function HourlyLoadCard({
  hours,
}: {
  hours: Array<{ hour: number; value: number }>;
}) {
  const t = useTranslations("Analytics.staff");
  // Map (hour → value) для быстрого доступа; отсутствующие → 0
  const byHour = new Map(hours.map(h => [h.hour, h.value]));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("hourlyLoad")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {HOURLY_LOAD_HOURS.map((hour, i) => {
            const value = byHour.get(hour) ?? 0;
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-sm motion-safe:transition-[height] motion-safe:duration-700"
                    style={{
                      // min-height чтобы пустые часы тоже было видно (тонкая
                      // полоска — "слот существует, но нагрузки нет")
                      height: `${Math.max(value * 100, 4)}%`,
                      backgroundColor: `hsl(var(--accent) / ${0.15 + value * 0.7})`,
                      transitionDelay: `${i * 30}ms`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {hour}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
