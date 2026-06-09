"use client";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";
import { formatPercent } from "@/src/shared/utils";
import type { IClientsAnalyticsDto } from "@/src/shared/types/analytics";
import { InsightBanner } from "../components/insight-banner";

/**
 * Карточка Retention — конверсия в повторный визит после 1/2/3 визитов.
 */
export function RetentionCard({
  retention,
}: {
  retention: IClientsAnalyticsDto["retention"];
}) {
  const t = useTranslations("Analytics");

  const Item = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <span className="text-base font-semibold tabular-nums">
        {formatPercent(value * 100)}
      </span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("charts.retention")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Item
          label={t("clients.retentionAfter", { n: 1 })}
          value={retention.after_1}
        />
        <Item
          label={t("clients.retentionAfter", { n: 2 })}
          value={retention.after_2}
        />
        <Item
          label={t("clients.retentionAfter", { n: 3 })}
          value={retention.after_3}
        />
        <div className="mt-3">
          <InsightBanner level="info">
            {t("insights.retentionFirst")}
          </InsightBanner>
        </div>
      </CardContent>
    </Card>
  );
}
