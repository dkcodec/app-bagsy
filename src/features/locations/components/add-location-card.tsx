"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddLocationCardProps {
  onClick: () => void;
}

/**
 * Dashed CTA-карточка «+ Добавить локацию» для network grid
 */
export function AddLocationCard({ onClick }: AddLocationCardProps) {
  const t = useTranslations("Locations.network");

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-h-[120px] rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors cursor-pointer"
    >
      <Plus className="h-5 w-5 text-muted-foreground mb-1" />
      <span className="text-[13px] text-muted-foreground">
        {t("addLocation")}
      </span>
    </button>
  );
}
