"use client";

import { useCalendar } from "@/src/features/calendar/calendar-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/entities/popover";
import { useState } from "react";
import type { TBadgeVariant } from "@/src/shared/types/calendar";

interface ChangeBadgeVariantInputProps {
  onBadgeVariantChange?: (variant: TBadgeVariant) => void;
  badgeVariant: TBadgeVariant;
  isMobile?: boolean;
}

export function ChangeBadgeVariantInput({
  onBadgeVariantChange,
  badgeVariant,
  isMobile = false,
}: ChangeBadgeVariantInputProps) {
  // const { badgeVariant } = useCalendar();
  const t = useTranslations("Dashboard.Settings");

  const [isOpen, setIsOpen] = useState(false);
  const handleValueChange = (value: TBadgeVariant) => {
    // Уведомляем родительский компонент об изменении
    onBadgeVariantChange?.(value);
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="flex items-center gap-2 w-fit"
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
        >
          <p className="text-sm font-semibold">{t("badgeVariant")}</p>
          <Info className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 text-center">
          <p className="text-sm">{t("badgeVariantTooltip")}</p>
        </PopoverContent>
      </Popover>

      <Select value={badgeVariant} onValueChange={handleValueChange}>
        <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="dot">{t("dot")}</SelectItem>
          <SelectItem value="colored">{t("colored")}</SelectItem>
          <SelectItem value="mixed">{t("mixed")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
