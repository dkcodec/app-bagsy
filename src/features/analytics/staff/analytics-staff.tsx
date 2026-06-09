"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/entities";
import { useStaffReport } from "@/src/shared/hooks/use-analytics";
import { formatPercent, formatTenge } from "@/src/shared/utils";
import { parsePeriodFromSearch } from "../utils/period";
import { ExportButton } from "../components/export-button";
import { InsightsCard } from "../overview/insights-card";
import { StaffLoadHeatmap } from "./staff-load-heatmap";
import { downloadCsv } from "../utils/csv";

/**
 * Таблица отчёта по мастерам + heatmap загрузки по дням недели.
 * Только для Manager/Owner (защищено гардом в page.tsx).
 */
export function AnalyticsStaff() {
  const t = useTranslations("Analytics");
  const tStaff = useTranslations("Analytics.staff");
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { data, isLoading } = useStaffReport(params);

  const handleRowClick = (employeeId: string) => {
    const qs = searchParams.toString();
    router.push(`/analytics/staff/${employeeId}${qs ? `?${qs}` : ""}`);
  };

  const handleExport = () => {
    if (!data) return;
    downloadCsv(
      `analytics-staff-${params.from}_${params.to}`,
      [
        tStaff("columns.name"),
        tStaff("columns.revenue"),
        tStaff("columns.bookings"),
        tStaff("columns.avgCheck"),
        tStaff("columns.load"),
        tStaff("columns.cancellations"),
        tStaff("columns.rating"),
      ],
      data.rows.map(r => [
        r.full_name,
        r.revenue,
        r.bookings,
        r.avg_check,
        `${r.load_percent}%`,
        `${r.cancellations.count} (${r.cancellations.percent}%)`,
        r.rating?.toFixed(1) ?? "—",
      ])
    );
  };

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("tabs.staff")}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tStaff("columns.name")}</TableHead>
                  <TableHead className="text-right">
                    {tStaff("columns.revenue")}
                  </TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    {tStaff("columns.bookings")}
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    {tStaff("columns.avgCheck")}
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    {tStaff("columns.load")}
                  </TableHead>
                  <TableHead className="text-right hidden lg:table-cell">
                    {tStaff("columns.cancellations")}
                  </TableHead>
                  <TableHead className="text-right hidden lg:table-cell">
                    {tStaff("columns.rating")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map(r => (
                  <TableRow
                    key={r.employee_id}
                    onClick={() => handleRowClick(r.employee_id)}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatTenge(r.revenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell">
                      {r.bookings}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden md:table-cell">
                      {formatTenge(r.avg_check)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden md:table-cell">
                      {formatPercent(r.load_percent)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden lg:table-cell">
                      {r.cancellations.count} ({r.cancellations.percent}%)
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden lg:table-cell">
                      {r.rating?.toFixed(1) ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {/* Экспорт — внизу карточки, после данных. На мобиле во всю ширину. */}
        <CardFooter className="border-t pt-4 justify-end">
          <ExportButton onExport={handleExport} disabled={!data.rows.length} />
        </CardFooter>
      </Card>

      <StaffLoadHeatmap
        rows={data.rows.map(r => ({ id: r.employee_id, name: r.full_name }))}
        load={data.weekday_load}
      />

      {data.insights.length > 0 && <InsightsCard insights={data.insights} />}
    </div>
  );
}
