"use client";
import { Crown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";
import { formatTenge } from "@/src/shared/utils";
import type { ITopItem } from "@/src/shared/types/analytics";
import { TopList } from "../components/top-list";
import { ChartEmptyState } from "../components/chart-empty-state";

/**
 * Карточка "Топ-5 мастеров". Клик → drill-down /analytics/staff/[id].
 * Сохраняет текущий период в URL.
 */
export function TopEmployeesCard({ items }: { items: ITopItem[] }) {
  const t = useTranslations("Analytics.charts");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (id: string) => {
    const qs = searchParams.toString();
    router.push(`/analytics/staff/${id}${qs ? `?${qs}` : ""}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-4 text-accent" />
          {t("topEmployees")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <ChartEmptyState />
        ) : (
          <TopList
            items={items.map(i => ({
              id: i.id,
              name: i.name,
              value: i.revenue,
              share: i.share,
            }))}
            format={formatTenge}
            onSelect={handleSelect}
          />
        )}
      </CardContent>
    </Card>
  );
}
