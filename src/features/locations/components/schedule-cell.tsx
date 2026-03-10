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
import { formatScheduleTime } from "@/src/shared/utils/formater";
import type { ISchedule } from "@/src/shared/types/user";

/**
 * Интерфейс для расписания локации
 */
interface ScheduleCellProps {
  schedule: ISchedule[];
}

/**
 * Маппинг дней недели (API: 0=вс, 6=сб)
 * 0 = воскресенье всегда
 */
const WEEK_DAYS = [
  { index: 0, name: "sunday", short: "sun" },
  { index: 1, name: "monday", short: "mon" },
  { index: 2, name: "tuesday", short: "tue" },
  { index: 3, name: "wednesday", short: "wed" },
  { index: 4, name: "thursday", short: "thu" },
  { index: 5, name: "friday", short: "fri" },
  { index: 6, name: "saturday", short: "sat" },
];

/**
 * Порядок дней для отображения в UI (понедельник первым)
 * Использует правильные индексы API
 */
const WEEK_DAYS_FOR_UI = [
  WEEK_DAYS[1], // Понедельник (index: 1)
  WEEK_DAYS[2], // Вторник (index: 2)
  WEEK_DAYS[3], // Среда (index: 3)
  WEEK_DAYS[4], // Четверг (index: 4)
  WEEK_DAYS[5], // Пятница (index: 5)
  WEEK_DAYS[6], // Суббота (index: 6)
  WEEK_DAYS[0], // Воскресенье (index: 0)
];

/**
 * Компонент для отображения расписания локации
 * Показывает компактную сводку в таблице и полное расписание в Popover
 */
export function ScheduleCell({ schedule }: ScheduleCellProps) {
  const t = useTranslations("Locations.schedule");
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

    // Обрабатываем дни в порядке UI (понедельник первым)
    WEEK_DAYS_FOR_UI.forEach(day => {
      const daySchedule = scheduleByDay[day.index];
      if (!daySchedule) return;

      // Ищем группу с таким же расписанием (formatScheduleTime для ISO и "HH:mm")
      const existingGroup = groups.find(
        g =>
          g.schedule.all_day === daySchedule.all_day &&
          formatScheduleTime(g.schedule.open) ===
            formatScheduleTime(daySchedule.open) &&
          formatScheduleTime(g.schedule.close) ===
            formatScheduleTime(daySchedule.close)
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
      // Сортируем дни по порядку UI (понедельник первым)
      const sortedDays = group.days.sort((a, b) => {
        const indexA = WEEK_DAYS_FOR_UI.findIndex(d => d.index === a);
        const indexB = WEEK_DAYS_FOR_UI.findIndex(d => d.index === b);
        return indexA - indexB;
      });

      const dayNames = sortedDays
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

      return `${dayRange}: ${formatScheduleTime(group.schedule.open)} - ${formatScheduleTime(group.schedule.close)}`;
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
          className="h-auto p-1 hover:bg-muted/50 cursor-pointer"
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
            {WEEK_DAYS_FOR_UI.map(day => {
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
                          {formatScheduleTime(daySchedule.open)} -{" "}
                          {formatScheduleTime(daySchedule.close)}
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
