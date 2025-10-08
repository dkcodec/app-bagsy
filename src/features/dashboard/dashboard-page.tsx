"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseISO, isValid, format } from "date-fns";
import { CalendarProvider } from "@/src/features/calendar";
import { DashboardHeader, DashboardContent } from "@/src/features";
import { Loader } from "lucide-react";
import { mockEvents, mockUsers } from "@/src/shared";

export function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Получаем вид из URL или используем "month" по умолчанию
  type View = "day" | "week" | "month" | "agenda";
  const isView = useCallback(
    (v: string): v is View =>
      ["day", "week", "month", "agenda"].includes(v as View),
    []
  );

  const getInitialView = (): View => {
    const viewParam = searchParams.get("view");
    return viewParam && isView(viewParam) ? viewParam : "month";
  };

  const [calendarView, setCalendarView] = useState<View>(getInitialView);

  // Обновляем URL при изменении вида
  const handleViewChange = (view: View) => {
    if (view === calendarView) return;
    setCalendarView(view);

    const current = searchParams.get("view");
    if (current === view) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`?${params.toString()}`, { scroll: false });
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

  // Обновляем URL при изменении даты
  const handleDateChange = (date: Date) => {
    const next = format(date, "yyyy-MM-dd");
    const current = searchParams.get("date");
    if (current === next) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Синхронизируем состояние с URL при изменении параметров
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam && isView(viewParam) && viewParam !== calendarView) {
      setCalendarView(viewParam);
    }
  }, [searchParams, calendarView, isView]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <>
      {isMounted ? (
        <CalendarProvider
          events={mockEvents}
          users={mockUsers}
          initialDate={getInitialDate()}
          onDateChange={handleDateChange}
        >
          <DashboardHeader />

          <DashboardContent
            calendarView={calendarView}
            handleViewChange={handleViewChange}
          />
        </CalendarProvider>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      )}
    </>
  );
}
