"use client";

import { useState, useEffect, useMemo } from "react";
import { Moon } from "lucide-react";
import { Switch } from "@/src/entities/switch";
import { TimeInput } from "@/src/entities/time-input";
import { Input } from "@/src/entities/input";
import { Label } from "@/src/entities/label";
import type { TimeValue } from "react-aria-components";
import { useTranslations } from "next-intl";
import type { ISchedule } from "@/src/shared/types/user";

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

interface ScheduleEditorProps {
  value: ISchedule[];
  onChange: (schedule: ISchedule[]) => void;
  isMobile?: boolean;
}

/**
 * Компонент для редактирования расписания точки обслуживания
 * Позволяет настроить расписание для каждого дня недели
 */
export function ScheduleEditor({
  value,
  onChange,
  isMobile = false,
}: ScheduleEditorProps) {
  const t = useTranslations("Points.addPointForm.schedule");
  const tDays = useTranslations("Dashboard.Settings");

  // Преобразуем массив расписания в объект для удобства работы
  const scheduleByDay = useMemo(() => {
    const result: Record<number, ISchedule> = {};
    value.forEach(item => {
      result[item.week_day] = item;
    });
    return result;
  }, [value]);

  // Инициализируем расписание для всех дней, если его нет
  useEffect(() => {
    if (value.length === 0) {
      const newSchedule: ISchedule[] = WEEK_DAYS.map(day => ({
        week_day: day.index,
        all_day: false,
        open: "09:00",
        close: "18:00",
        comment: "",
      }));
      onChange(newSchedule);
    }
  }, [value.length, onChange]);

  // Обработчик переключения дня (активен/неактивен)
  const handleToggleDay = (dayIndex: number) => {
    const daySchedule = scheduleByDay[dayIndex];
    const newSchedule = [...value];

    if (daySchedule) {
      // Удаляем день из расписания
      const index = newSchedule.findIndex(s => s.week_day === dayIndex);
      if (index !== -1) {
        newSchedule.splice(index, 1);
      }
    } else {
      // Добавляем день с дефолтными значениями
      newSchedule.push({
        week_day: dayIndex,
        all_day: false,
        open: "09:00",
        close: "18:00",
        comment: "",
      });
    }

    onChange(newSchedule);
  };

  // Обработчик изменения времени открытия
  const handleTimeChange = (
    dayIndex: number,
    timeType: "open" | "close",
    timeValue: TimeValue | null
  ) => {
    if (!timeValue) return;

    const formattedTime = `${String(timeValue.hour).padStart(2, "0")}:${String(
      timeValue.minute || 0
    ).padStart(2, "0")}`;

    const daySchedule = scheduleByDay[dayIndex];
    if (!daySchedule) return;

    const newSchedule = value.map(item =>
      item.week_day === dayIndex ? { ...item, [timeType]: formattedTime } : item
    );

    onChange(newSchedule);
  };

  // Обработчик переключения "весь день"
  const handleToggleAllDay = (dayIndex: number) => {
    const daySchedule = scheduleByDay[dayIndex];
    if (!daySchedule) return;

    const newSchedule = value.map(item =>
      item.week_day === dayIndex
        ? {
            ...item,
            all_day: !item.all_day,
            open: !item.all_day ? "" : item.open,
            close: !item.all_day ? "" : item.close,
          }
        : item
    );

    onChange(newSchedule);
  };

  // Обработчик изменения комментария
  const handleCommentChange = (dayIndex: number, comment: string) => {
    const daySchedule = scheduleByDay[dayIndex];
    if (!daySchedule) return;

    const newSchedule = value.map(item =>
      item.week_day === dayIndex ? { ...item, comment } : item
    );

    onChange(newSchedule);
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">{t("title")}</h4>
      <div className="space-y-4">
        {WEEK_DAYS_FOR_UI.map(day => {
          const daySchedule = scheduleByDay[day.index];
          const isDayActive = !!daySchedule;

          return (
            <div
              key={day.index}
              className={`${
                isMobile
                  ? "flex flex-col gap-3 p-3 border rounded-lg"
                  : "flex flex-col gap-3 p-3 border rounded-lg"
              }`}
            >
              {/* Заголовок дня с переключателем */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={isDayActive}
                  onCheckedChange={() => handleToggleDay(day.index)}
                />
                <span className="font-medium text-sm">{tDays(day.name)}</span>
              </div>

              {isDayActive && daySchedule ? (
                <div className="flex flex-col gap-3 pl-11">
                  {/* Переключатель "Весь день" */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={daySchedule.all_day}
                      onCheckedChange={() => handleToggleAllDay(day.index)}
                    />
                    <Label htmlFor={`all-day-${day.index}`} className="text-sm">
                      {t("allDay")}
                    </Label>
                  </div>

                  {/* Время работы (если не весь день) */}
                  {!daySchedule.all_day && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm font-medium">
                          {tDays("from")}
                        </Label>
                        <TimeInput
                          id={`${day.name}-open`}
                          hourCycle={24}
                          granularity="minute"
                          value={
                            daySchedule.open
                              ? (() => {
                                  const [hours, minutes] =
                                    daySchedule.open.split(":");
                                  return {
                                    hour: parseInt(hours || "9", 10),
                                    minute: parseInt(minutes || "0", 10),
                                  } as TimeValue;
                                })()
                              : ({ hour: 9, minute: 0 } as TimeValue)
                          }
                          onChange={value =>
                            handleTimeChange(day.index, "open", value)
                          }
                          className="flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm font-medium">
                          {tDays("to")}
                        </Label>
                        <TimeInput
                          id={`${day.name}-close`}
                          hourCycle={24}
                          granularity="minute"
                          value={
                            daySchedule.close
                              ? (() => {
                                  const [hours, minutes] =
                                    daySchedule.close.split(":");
                                  return {
                                    hour: parseInt(hours || "18", 10),
                                    minute: parseInt(minutes || "0", 10),
                                  } as TimeValue;
                                })()
                              : ({ hour: 18, minute: 0 } as TimeValue)
                          }
                          onChange={value =>
                            handleTimeChange(day.index, "close", value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Комментарий */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`comment-${day.index}`} className="text-sm">
                      {t("comment")}
                    </Label>
                    <Input
                      id={`comment-${day.index}`}
                      placeholder={t("comment")}
                      value={daySchedule.comment || ""}
                      onChange={e =>
                        handleCommentChange(day.index, e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground pl-11">
                  <Moon className="size-4" />
                  <span className="text-sm">{tDays("closed")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
