"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseISO, isValid, format } from "date-fns";
import { CalendarProvider } from "@/src/features/calendar";
import { DashboardHeader, DashboardContent } from "@/src/features";
import { Loader } from "lucide-react";
import { useCalendar as useCalendarApi } from "@/src/shared/hooks/use-calendar";
import { toast } from "sonner";

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
    return viewParam && isView(viewParam) ? viewParam : "day";
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

  // Получаем начальную дату
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getInitialDate()
  );

  // Состояние для masterPhone (будет обновляться через CalendarProvider при изменении selectedMasterPhone)
  const [masterPhone, setMasterPhone] = useState<string | undefined>(undefined);

  // Обертка для setMasterPhone, которая обновляет состояние только если значение изменилось
  const handleMasterPhoneChange = React.useCallback(
    (newMasterPhone: string | undefined) => {
      setMasterPhone(prev => {
        if (prev !== newMasterPhone) {
          return newMasterPhone;
        }
        return prev;
      });
    },
    []
  );

  // Обновляем selectedDate при изменении даты в URL (только если дата действительно изменилась)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    let newDate: Date;

    if (dateParam) {
      const parsedDate = parseISO(dateParam);
      if (isValid(parsedDate)) {
        newDate = parsedDate;
      } else {
        return; // Не обновляем, если дата невалидна
      }
    } else {
      // Если дата не указана в URL, не обновляем состояние (оставляем текущее значение)
      return;
    }

    // Обновляем только если дата действительно изменилась
    setSelectedDate(prevDate => {
      if (format(newDate, "yyyy-MM-dd") !== format(prevDate, "yyyy-MM-dd")) {
        return newDate;
      }
      return prevDate;
    });
  }, [searchParams]);

  // Загружаем данные календаря через API
  // TODO: Добавить поддержку выбора точки для SelfOwner/NetManager
  const { events, masters, isLoading, isError, error } = useCalendarApi({
    selectedDate,
    view: calendarView,
    masterPhone,
  });

  // Обработка ошибок загрузки
  useEffect(() => {
    if (isError && error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка загрузки данных календаря";
      toast.error(errorMessage);
    }
  }, [isError, error]);

  return (
    <>
      {isMounted ? (
        <CalendarProvider
          events={events}
          masters={masters}
          initialDate={selectedDate}
          onDateChange={date => {
            // Проверяем, изменилась ли дата перед обновлением
            if (
              format(date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")
            ) {
              handleDateChange(date);
              setSelectedDate(date);
            }
          }}
          onMasterPhoneChange={handleMasterPhoneChange}
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
