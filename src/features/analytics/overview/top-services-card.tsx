"use client";
import { Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";
import { formatTenge } from "@/src/shared/utils";
import type { ITopItem } from "@/src/shared/types/analytics";
import { TopList } from "../components/top-list";
import { ChartEmptyState } from "../components/chart-empty-state";

/** Карточка "Топ-5 услуг". */
export function TopServicesCard({ items }: { items: ITopItem[] }) {
  const t = useTranslations("Analytics.charts");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="size-4 text-accent" />
          {t("topServices")}
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
          />
        )}
      </CardContent>
    </Card>
  );
}
