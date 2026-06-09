"use client";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/entities";

/**
 * Универсальная кнопка экспорта CSV.
 * onExport вызывается родителем — он сам собирает данные и зовёт downloadCsv.
 */
export function ExportButton({
  onExport,
  disabled,
}: {
  onExport: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Analytics");
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={disabled}
      className="gap-2"
    >
      <Download className="size-4" />
      {t("exportCsv")}
    </Button>
  );
}
