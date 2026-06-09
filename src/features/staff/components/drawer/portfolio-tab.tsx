"use client";

import { useTranslations } from "next-intl";

/**
 * Таб «Портфолио» — плейсхолдер (будет реализовано позже)
 */
export function PortfolioTab() {
  const td = useTranslations("Staff.drawer");

  return (
    <div className="px-5 py-4">
      {/* Сетка плейсхолдеров работ */}
      <div className="grid grid-cols-3 gap-1 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-sm" />
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {td("portfolioPlaceholder")}
      </p>
    </div>
  );
}
