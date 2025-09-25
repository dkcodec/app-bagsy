"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import {
  CalendarProvider,
  ClientContainer,
  mockEvents,
  mockUsers,
} from "@/src/calendar";
import { ChangeBadgeVariantInput } from "@/src/calendar/components/change-badge-variant-input";
import { useTranslations } from "next-intl";
import { Loader, Loader2 } from "lucide-react";
import { ChangeWorkingHoursInput } from "../calendar/components/change-working-hours-input";
import { ChangeVisibleHoursInput } from "../calendar/components/change-visible-hours-input";

const DashboardContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("Dashboard.content");
  // Получаем вид из URL или используем "month" по умолчанию
  type View = "day" | "week" | "month" | "year" | "agenda";
  const isView = (v: string): v is View =>
    ["day", "week", "month", "year", "agenda"].includes(v as View);

  const getInitialView = (): View => {
    const viewParam = searchParams.get("view");
    return viewParam && isView(viewParam) ? viewParam : "month";
  };

  const [calendarView, setCalendarView] = useState<View>(getInitialView);

  // Обновляем URL при изменении вида
  const handleViewChange = (view: View) => {
    setCalendarView(view);

    // Создаем новые параметры URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);

    // Обновляем URL без перезагрузки страницы
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Получаем дату из URL или используем текущую дату
  const getInitialDate = (): Date => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = parseISO(dateParam);
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);

  // Обновляем URL при изменении даты
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(date, "yyyy-MM-dd"));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Синхронизируем состояние с URL при изменении параметров
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam && isView(viewParam)) {
      setCalendarView(viewParam);
    }

    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = parseISO(dateParam);
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
      }
    }
  }, [searchParams]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 border border-border" />
        <div className="aspect-video rounded-xl bg-muted/50 border border-border" />
        <div className="aspect-video rounded-xl bg-muted/50 border border-border" />
      </div>
      {isMounted ? (
        <CalendarProvider
          events={mockEvents}
          users={mockUsers}
          initialDate={selectedDate}
          onDateChange={handleDateChange}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("calendar")}</h2>
              <div className="flex items-center gap-4">
                <ChangeBadgeVariantInput />
              </div>
            </div>
            <ClientContainer
              view={calendarView}
              onViewChange={handleViewChange}
            />
            <ChangeWorkingHoursInput />
            <ChangeVisibleHoursInput />
          </div>
        </CalendarProvider>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
