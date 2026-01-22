"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseISO, isValid, format } from "date-fns";
import { CalendarProvider } from "@/src/features/calendar";
import { DashboardHeader, DashboardContent } from "@/src/features";
import { Loader } from "lucide-react";
import { useCalendar as useCalendarApi } from "@/src/shared/hooks/use-calendar";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useNetworkPoints } from "@/src/shared/hooks/use-network-points";
import { EUserRole } from "@/src/shared/types/user";
import { EmptyPointsState } from "@/src/features/dashboard/empty-points-state";
import { toast } from "sonner";
import EmptyPointsHeader from "./empty-points-header";

export function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Получаем текущего пользователя
  const { data: currentUser } = useCurrentUser();

  // Определяем, нужно ли загружать точки (только для net_manager и self_owner)
  const shouldLoadPoints = useMemo(() => {
    return (
      currentUser &&
      (currentUser.role === EUserRole.NET_MANAGER ||
        currentUser.role === EUserRole.SELF_OWNER)
    );
  }, [currentUser]);

  // Загружаем точки сети для net_manager и self_owner
  const {
    data: networkPointsData,
    isLoading: isLoadingPoints,
    isError: isPointsError,
    error: pointsError,
  } = useNetworkPoints(currentUser?.network_code);

  // Автоматически выбираем первую точку из списка при загрузке
  const selectedPointCode = useMemo(() => {
    // Для ролей с выбором точки - используем первую из списка
    if (shouldLoadPoints && networkPointsData) {
      const points = networkPointsData.points;
      if (points && points.length > 0) {
        return points[0].code;
      }
    }
    // Для других ролей - используем point_code из currentUser
    return currentUser?.point_code;
  }, [shouldLoadPoints, networkPointsData, currentUser?.point_code]);

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
  // Передаем selectedPointCode для net_manager и self_owner
  const { events, masters, isError, error } = useCalendarApi({
    selectedDate,
    view: calendarView,
    pointCode: selectedPointCode,
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

  // Обработка ошибок загрузки точек
  useEffect(() => {
    if (isPointsError && pointsError) {
      const errorMessage =
        pointsError instanceof Error
          ? pointsError.message
          : "Ошибка загрузки точек сети";
      toast.error(errorMessage);
    }
  }, [isPointsError, pointsError]);

  // Если точек нет (пустой массив) - показываем EmptyPointsState
  const hasNoPoints =
    shouldLoadPoints &&
    !isLoadingPoints &&
    networkPointsData &&
    networkPointsData.points.length === 0;

  // Для NET_MANAGER и SELF_OWNER точка обязательна - не показываем календарь без точки
  const shouldShowCalendar =
    !shouldLoadPoints || (shouldLoadPoints && selectedPointCode);

  // Показываем загрузку пока монтируется компонент или загружаются точки
  if (!isMounted || (shouldLoadPoints && isLoadingPoints)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Если точек нет - показываем EmptyPointsState
  if (hasNoPoints) {
    return (
      <>
        <EmptyPointsHeader />
        <EmptyPointsState />
      </>
    );
  }

  // Для NET_MANAGER и SELF_OWNER не показываем календарь, пока точка не выбрана
  if (!shouldShowCalendar) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <CalendarProvider
      events={events}
      masters={masters}
      initialDate={selectedDate}
      selectedPointCode={selectedPointCode}
      onDateChange={date => {
        // Проверяем, изменилась ли дата перед обновлением
        if (format(date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")) {
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
  );
}
