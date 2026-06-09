"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/src/entities";
import { useFinanceReport } from "@/src/shared/hooks/use-analytics";
import { formatPercent, formatTenge } from "@/src/shared/utils";
import { parsePeriodFromSearch } from "../utils/period";
import { ExportButton } from "../components/export-button";
import { downloadCsv } from "../utils/csv";

/**
 * Финансовый отчёт. Содержит:
 *  - выручка (услуги + товары [скоро])
 *  - зарплаты по мастерам
 *  - валовая прибыль и маржа
 */
export function AnalyticsFinance() {
  const t = useTranslations("Analytics.finance");
  const searchParams = useSearchParams();
  const params = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { data, isLoading } = useFinanceReport(params);

  const handleExport = () => {
    if (!data) return;
    downloadCsv(
      `analytics-finance-${params.from}_${params.to}`,
      [t("metric"), t("amount")],
      [
        [t("services"), data.revenue.services],
        [t("products"), data.revenue.products],
        [t("revenueTotal"), data.revenue.total],
        ...data.payroll.map(p => [
          `${p.full_name} (${p.commission_percent}%)`,
          p.amount,
        ]),
        [t("payrollTotal"), data.payroll_total],
        [t("gross"), data.gross_profit],
      ]
    );
  };

  if (isLoading || !data) {
    return (
      <div className="p-4">
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 print:p-0">
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-accent" />
              {t("title")}
            </CardTitle>
            <div className="flex gap-2 print:hidden">
              <ExportButton onExport={handleExport} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="size-4" />
                {t("print")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Выручка */}
          <Section title={t("revenue")}>
            <Row
              label={t("services")}
              value={formatTenge(data.revenue.services)}
            />
            <Row
              label={
                <span>
                  {t("products")}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({t("comingSoon")})
                  </span>
                </span>
              }
              value={formatTenge(data.revenue.products)}
              dim
            />
            <Total
              label={t("revenueTotal")}
              value={formatTenge(data.revenue.total)}
            />
          </Section>

          {/* Зарплаты */}
          <Section title={t("payroll")}>
            {data.payroll.map(p => (
              <Row
                key={p.employee_id}
                label={`${p.full_name} (${p.commission_percent}% ${t("ofServices")})`}
                value={formatTenge(p.amount)}
              />
            ))}
            <Total
              label={t("payrollTotal")}
              value={formatTenge(data.payroll_total)}
            />
          </Section>

          {/* Прибыль */}
          <div className="rounded-lg border bg-accent-50 dark:bg-accent-950/30 p-4 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>{t("gross")}</span>
              <span className="tabular-nums">
                {formatTenge(data.gross_profit)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("margin")}</span>
              <span className="tabular-nums">
                {formatPercent(data.margin_percent)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-2">
        {title}
      </h3>
      <Separator className="mb-2" />
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  dim,
}: {
  label: React.ReactNode;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className={`flex justify-between text-sm ${dim ? "opacity-60" : ""}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-semibold pt-1.5 border-t mt-1.5">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
