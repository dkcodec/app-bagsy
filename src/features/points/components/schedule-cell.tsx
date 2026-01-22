"use client";

import { useState, useMemo } from "react";
import { Clock, Moon, Sun } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@/src/entities";
import { useTranslations } from "next-intl";
import type { ISchedule } from "@/src/shared/types/user";

/**
 * Интерфейс для расписания точки
 */
interface ScheduleCellProps {
  schedule: ISchedule[];
}

/**
 * Маппинг дней недели (API: 0=вс, 6=сб)
 */
const WEEK_DAYS = [
  { index: 1, name: "monday", short: "mon" },
  { index: 2, name: "tuesday", short: "tue" },
  { index: 3, name: "wednesday", short: "wed" },
  { index: 4, name: "thursday", short: "thu" },
  { index: 5, name: "friday", short: "fri" },
  { index: 6, name: "saturday", short: "sat" },
  { index: 0, name: "sunday", short: "sun" },
];

/**
 * Компонент для отображения расписания точки
 * Показывает компактную сводку в таблице и полное расписание в Popover
 */
export function ScheduleCell({ schedule }: ScheduleCellProps) {
  const t = useTranslations("Points.schedule");
  const tDays = useTranslations("Dashboard.Settings");
  const [isOpen, setIsOpen] = useState(false);

  // Группируем расписание по дням
  const scheduleByDay = useMemo(() => {
    const result: Record<number, ISchedule> = {};
    schedule.forEach(item => {
      result[item.week_day] = item;
    });
    return result;
  }, [schedule]);

  // Формируем краткую сводку для отображения в таблице
  const summary = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return t("noSchedule");
    }

    // Группируем одинаковые расписания
    const groups: Array<{
      days: number[];
      schedule: ISchedule;
    }> = [];

    WEEK_DAYS.forEach(day => {
      const daySchedule = scheduleByDay[day.index];
      if (!daySchedule) return;

      // Ищем группу с таким же расписанием
      const existingGroup = groups.find(
        g =>
          g.schedule.all_day === daySchedule.all_day &&
          g.schedule.open === daySchedule.open &&
          g.schedule.close === daySchedule.close
      );

      if (existingGroup) {
        existingGroup.days.push(day.index);
      } else {
        groups.push({
          days: [day.index],
          schedule: daySchedule,
        });
      }
    });

    // Формируем строку сводки
    if (groups.length === 0) {
      return t("noSchedule");
    }

    const summaryParts = groups.map(group => {
      const dayNames = group.days
        .map(dayIndex => {
          const day = WEEK_DAYS.find(d => d.index === dayIndex);
          return day ? tDays(day.short) : "";
        })
        .filter(Boolean);

      const dayRange =
        dayNames.length === 1
          ? dayNames[0]
          : `${dayNames[0]}-${dayNames[dayNames.length - 1]}`;

      if (group.schedule.all_day) {
        return `${dayRange}: ${t("allDay")}`;
      }

      if (!group.schedule.open || !group.schedule.close) {
        return `${dayRange}: ${t("closed")}`;
      }

      return `${dayRange}: ${group.schedule.open} - ${group.schedule.close}`;
    });

    return summaryParts.join(", ");
  }, [schedule, scheduleByDay, t, tDays]);

  // Проверяем, есть ли активные дни
  const hasActiveDays = useMemo(() => {
    return schedule.some(item => item.all_day || (item.open && item.close));
  }, [schedule]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            {hasActiveDays ? (
              <Clock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground max-w-[200px] truncate">
              {summary}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{t("viewSchedule")}</h4>
          <div className="space-y-2">
            {WEEK_DAYS.map(day => {
              const daySchedule = scheduleByDay[day.index];

              return (
                <div
                  key={day.index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{tDays(day.name)}</span>
                  <div className="flex items-center gap-2">
                    {!daySchedule ? (
                      <>
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t("closed")}
                        </span>
                      </>
                    ) : daySchedule.all_day ? (
                      <>
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span>{t("allDay")}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {daySchedule.open} - {daySchedule.close}
                        </span>
                        {daySchedule.comment && (
                          <span className="text-xs text-muted-foreground">
                            ({daySchedule.comment})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
