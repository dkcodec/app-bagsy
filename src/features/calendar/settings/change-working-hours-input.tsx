"use client";

import { useState, useEffect } from "react";
import { Info, Moon } from "lucide-react";
import { useCalendar } from "@/src/features/calendar/calendar-context";

import { Switch } from "@/src/entities/switch";
import { TimeInput } from "@/src/entities/time-input";

import type { TimeValue } from "react-aria-components";
import { useTranslations } from "next-intl";
import type { TWorkingHours } from "@/src/shared/types/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/entities/popover";

const DAYS_OF_WEEK = [
  { index: 0, name: "monday" },
  { index: 1, name: "tuesday" },
  { index: 2, name: "wednesday" },
  { index: 3, name: "thursday" },
  { index: 4, name: "friday" },
  { index: 5, name: "saturday" },
  { index: 6, name: "sunday" },
];

interface ChangeWorkingHoursInputProps {
  onWorkingHoursChange?: (workingHours: TWorkingHours) => void;
  isMobile?: boolean;
}

export function ChangeWorkingHoursInput({
  onWorkingHoursChange,
  isMobile = false,
}: ChangeWorkingHoursInputProps) {
  const { workingHours } = useCalendar();
  const t = useTranslations("Dashboard.Settings");

  const [localWorkingHours, setLocalWorkingHours] = useState({
    ...workingHours,
  });
  const [isOpen, setIsOpen] = useState(false);
  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    onWorkingHoursChange?.(localWorkingHours);
  }, [localWorkingHours, onWorkingHoursChange]);

  const handleToggleDay = (dayId: number) => {
    setLocalWorkingHours(prev => ({
      ...prev,
      [dayId]:
        prev[dayId].from > 0 || prev[dayId].to > 0
          ? { from: 0, to: 0 }
          : { from: 9, to: 17 },
    }));
  };

  const handleTimeChange = (
    dayId: number,
    timeType: "from" | "to",
    value: TimeValue | null
  ) => {
    if (!value) return;

    setLocalWorkingHours(prev => {
      const updatedDay = { ...prev[dayId], [timeType]: value.hour };
      if (timeType === "to" && value.hour === 0 && updatedDay.from === 0)
        updatedDay.to = 24;
      return { ...prev, [dayId]: updatedDay };
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          className="flex items-center gap-2 w-fit"
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
        >
          <p className="text-sm font-semibold">{t("workingHours")}</p>
          <Info className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 text-center">
          <p className="text-sm">{t("workingHoursTooltip")}</p>
        </PopoverContent>
      </Popover>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const isDayActive =
            localWorkingHours[day.index].from > 0 ||
            localWorkingHours[day.index].to > 0;

          return (
            <div
              key={day.index}
              className={`${
                isMobile
                  ? "flex flex-col gap-3 p-3 border rounded-lg"
                  : "flex items-center gap-4"
              }`}
            >
              <div className={`flex items-center gap-2 w-full`}>
                <Switch
                  checked={isDayActive}
                  onCheckedChange={() => handleToggleDay(day.index)}
                />
                <span
                  className={`font-medium ${isMobile ? "text-sm" : "text-sm"}`}
                >
                  {t(day.name)}
                </span>
              </div>

              {isDayActive ? (
                <div className={`flex items-center gap-4 `}>
                  <div
                    className={`flex items-center gap-2 ${isMobile ? "w-full justify-between" : ""}`}
                  >
                    <span className={isMobile ? "text-sm font-medium" : ""}>
                      {t("from")}
                    </span>
                    <TimeInput
                      id={`${day.name.toLowerCase()}-from`}
                      hourCycle={12}
                      granularity="hour"
                      value={
                        {
                          hour: localWorkingHours[day.index].from,
                          minute: 0,
                        } as TimeValue
                      }
                      onChange={value =>
                        handleTimeChange(day.index, "from", value)
                      }
                      className={isMobile ? "w-24" : ""}
                    />
                  </div>

                  <div
                    className={`flex items-center gap-2 ${isMobile ? "w-full justify-between" : ""}`}
                  >
                    <span className={isMobile ? "text-sm font-medium" : ""}>
                      {t("to")}
                    </span>
                    <TimeInput
                      id={`${day.name.toLowerCase()}-to`}
                      hourCycle={12}
                      granularity="hour"
                      value={
                        {
                          hour: localWorkingHours[day.index].to,
                          minute: 0,
                        } as TimeValue
                      }
                      onChange={value =>
                        handleTimeChange(day.index, "to", value)
                      }
                      className={isMobile ? "w-24" : ""}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 text-muted-foreground ${isMobile ? "w-full" : ""}`}
                >
                  <Moon className="size-4" />
                  <span className={isMobile ? "text-sm" : ""}>
                    {t("closed")}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
