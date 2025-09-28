"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";

import { useCalendar } from "@/src/features/calendar/calendar-context";

import { TimeInput } from "@/src/entities/time-input";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/entities/popover";

import type { TimeValue } from "react-aria-components";

interface ChangeVisibleHoursInputProps {
  onVisibleHoursChange?: (visibleHours: { from: number; to: number }) => void;
  isMobile?: boolean;
}

export function ChangeVisibleHoursInput({
  onVisibleHoursChange,
  isMobile = false,
}: ChangeVisibleHoursInputProps) {
  const { visibleHours } = useCalendar();
  const t = useTranslations("Dashboard.Settings");

  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState<{ hour: number; minute: number }>({
    hour: visibleHours.from,
    minute: 0,
  });
  const [to, setTo] = useState<{ hour: number; minute: number }>({
    hour: visibleHours.to,
    minute: 0,
  });

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    const toHour = to.hour === 0 ? 24 : to.hour;
    onVisibleHoursChange?.({ from: from.hour, to: toHour });
  }, [from, to, onVisibleHoursChange]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="flex items-center gap-2 w-fit"
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
        >
          <p className="text-sm font-semibold">{t("visibleHours")}</p>
          <Info className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 text-center">
          <p className="text-sm">{t("visibleHoursTooltip")}</p>
        </PopoverContent>
      </Popover>

      <div
        className={`flex items-center gap-4 ${isMobile ? "flex-col gap-3" : ""}`}
      >
        <div
          className={`flex items-center gap-2 ${isMobile ? "w-full justify-between" : ""}`}
        >
          <p className={isMobile ? "text-sm font-medium" : ""}>С</p>
          <TimeInput
            id="start-time"
            hourCycle={12}
            granularity="hour"
            value={from as TimeValue}
            onChange={setFrom as (value: TimeValue | null) => void}
            className={isMobile ? "w-24" : ""}
          />
        </div>

        <div
          className={`flex items-center gap-2 ${isMobile ? "w-full justify-between" : ""}`}
        >
          <p className={isMobile ? "text-sm font-medium" : ""}>До</p>
          <TimeInput
            id="end-time"
            hourCycle={12}
            granularity="hour"
            value={to as TimeValue}
            onChange={setTo as (value: TimeValue | null) => void}
            className={isMobile ? "w-24" : ""}
          />
        </div>
      </div>
    </div>
  );
}
