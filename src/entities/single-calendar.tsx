"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ru, kk } from "react-day-picker/locale";

import { buttonVariants } from "@/src/entities/button";

import { cn } from "@/src/shared/utils/styles";

// Анализ: Ошибка связана с тем, что в типе DayPickerSingleProps нет свойств className, classNames, showOutsideDays. Это вызывает ошибки типов. Возможно, эти пропсы нужны для кастомизации, но их нужно явно добавить в пропсы компонента или использовать Partial/any. Также стоит проверить, нужны ли все эти пропсы DayPicker, и не дублируются ли они. Можно упростить типизацию, чтобы избежать ошибок и сохранить гибкость.

// Решение 1 (минимализм, расширяемость, комментарии):
import type { DayPickerSingleProps } from "react-day-picker";
import { useLocale } from "next-intl";

// Добавляем свои пропсы через расширение типа
interface SingleCalendarProps
  extends Omit<
    DayPickerSingleProps,
    "className" | "classNames" | "showOutsideDays"
  > {
  className?: string; // для кастомных стилей
  classNames?: Record<string, string>; // для кастомных классов
  showOutsideDays?: boolean; // показывать ли дни вне месяца
}

// Основная функция календаря
function SingleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  ...props
}: SingleCalendarProps) {
  // Состояние текущего месяца, если выбранная дата есть
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(
    selected instanceof Date ? selected : undefined
  );
  const locale = useLocale();

  return (
    <DayPicker
      selected={selected}
      showOutsideDays={showOutsideDays}
      captionLayout="label"
      locale={locale === "ru" ? ru : kk}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-3", className)}
      classNames={{
        root: "relative",
        months: "flex flex-col sm:flex-row gap-4 w-fit",
        month: "relative space-y-3", // <-- relative тут

        /* заголовок месяца по центру одной строки */
        month_caption: "flex items-center justify-center h-8 px-8",
        caption_label: "text-sm font-medium text-center",

        /* навигация поверх caption, по бокам */
        nav: "absolute inset-x-0 top-3 flex items-center justify-between px-4 h-8 pointer-events-none z-10",
        chevron: "dark:fill-white",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-auto h-7 w-7 p-0 bg-transparent opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-auto h-7 w-7 p-0 bg-transparent opacity-70 hover:opacity-100"
        ),

        /* сетка и дни как у тебя */
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        weeks: "",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 rounded-md",
          "[&:has([aria-selected])]:rounded-md",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected].range_end)]:rounded-r-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        range_start: "day-range-start",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        range_end: "day-range-end",

        ...classNames,
      }}
      /* Примечание: я не переопределяю Chevron, т.к. в v9 он не принимает
         'orientation', а направление обрабатывается внутри кнопок и стилями. */
      {...props}
    />
  );
}
SingleCalendar.displayName = "Calendar";

export { SingleCalendar };
