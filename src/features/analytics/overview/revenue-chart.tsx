"use client";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/entities";
import { formatTenge, formatAxisNumber } from "@/src/shared/utils";
import type { IDailyPoint } from "@/src/shared/types/analytics";
import { CHART_ANIMATION, CHART_COLORS } from "../constants";
import { ChartEmptyState } from "../components/chart-empty-state";

/**
 * AreaChart выручки по дням + overlay-линия "прошлый период" для сравнения.
 * Цвета берутся из брендовой палитры (accent) и --muted-foreground.
 */
export function RevenueChart({ data }: { data: IDailyPoint[] }) {
  const t = useTranslations("Analytics");

  const config: ChartConfig = {
    value: { label: t("kpi.revenue"), color: CHART_COLORS.primary },
    prev_value: { label: t("prevPeriod"), color: CHART_COLORS.compare },
  };

  const empty = data.length === 0 || data.every(d => d.value === 0);

  // Формат даты для оси X — короткий "DD.MM"
  const formatDate = (d: string) => {
    const [, m, day] = d.split("-");
    return `${day}.${m}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.revenueByDay")}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {empty ? (
          <ChartEmptyState />
        ) : (
          <ChartContainer
            config={config}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={n => formatAxisNumber(Number(n))}
                tickLine={false}
                axisLine={false}
                width={43}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    formatter={v => formatTenge(Number(v))}
                    labelFormatter={l => formatDate(String(l))}
                  />
                }
              />
              {/* Прошлый период — тонкая пунктирная линия */}
              <Line
                type="monotone"
                dataKey="prev_value"
                stroke="var(--color-prev_value)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                {...CHART_ANIMATION}
              />
              {/* Текущий период — заливка градиентом */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                {...CHART_ANIMATION}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
