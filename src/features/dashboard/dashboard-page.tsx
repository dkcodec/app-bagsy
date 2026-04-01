"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseISO, isValid, format } from "date-fns";
import { CalendarProvider } from "@/src/features/calendar";
import { DashboardHeader, DashboardContent } from "@/src/features";
import { Loader } from "lucide-react";
import { useCalendar as useCalendarApi } from "@/src/shared/hooks/use-calendar";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { EUserRole } from "@/src/shared/types/user";
import { EmptyLocationsState } from "@/src/features/dashboard/empty-locations-state";
import { toast } from "sonner";
import EmptyLocationsHeader from "./empty-locations-header";

type View = "day" | "week" | "month" | "agenda";
const VIEWS = new Set<string>(["day", "week", "month", "agenda"]);
const isView = (v: string): v is View => VIEWS.has(v);

export function DashboardPage() {
  const searchParams = useSearchParams();

  const getInitialView = (): View => {
    const viewParam = searchParams.get("view");
    return viewParam && isView(viewParam) ? viewParam : "day";
  };

  const [calendarView, setCalendarView] = useState<View>(getInitialView);

  // Обновляем URL при изменении вида
  const handleViewChange = (view: View) => {
    if (view === calendarView) return;
    setCalendarView(view);
    setUrlParam("view", view);
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
    setUrlParam("date", format(date, "yyyy-MM-dd"));
  };

  // Синхронизируем состояние с URL при изменении параметров
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam && isView(viewParam) && viewParam !== calendarView) {
      setCalendarView(viewParam);
    }
  }, [searchParams, calendarView]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Получаем текущего пользователя
  const { data: currentUser } = useCurrentUser();

  // Определяем, нужно ли загружать локации (только для Owner)
  const shouldLoadLocations = currentUser?.role === EUserRole.OWNER;

  // Загружаем локации организации для Owner
  const {
    data: locationsData,
    isLoading: isLoadingLocations,
    isError: isLocationsError,
    error: locationsError,
  } = useLocations();

  // Хелпер: обновить query-параметр в URL без навигации Next.js
  // (window.history.replaceState не триггерит Suspense, в отличие от router.replace)
  const setUrlParam = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      if (params.get(key) === value) return;
      params.set(key, value);
    } else {
      if (!params.has(key)) return;
      params.delete(key);
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, []);

  // Выбранная локация: из URL → первая локация → currentUser.location_id
  const [selectedLocationId, setSelectedLocationId] = useState<
    string | undefined
  >(() => searchParams.get("location") ?? undefined);

  // Инициализируем локацией при загрузке (если нет в URL)
  useEffect(() => {
    if (
      shouldLoadLocations &&
      locationsData?.locations?.length &&
      !selectedLocationId
    ) {
      const id = locationsData.locations[0].id;
      setSelectedLocationId(id);
      setUrlParam("location", id);
    }
    if (
      !shouldLoadLocations &&
      currentUser?.location_id &&
      !selectedLocationId
    ) {
      setSelectedLocationId(currentUser.location_id);
    }
  }, [
    shouldLoadLocations,
    locationsData,
    currentUser?.location_id,
    selectedLocationId,
    setUrlParam,
  ]);

  // Обёртка: обновляет state + URL при смене локации
  const handleLocationChange = useCallback(
    (locationId: string) => {
      setSelectedLocationId(locationId);
      setUrlParam("location", locationId);
    },
    [setUrlParam]
  );

  // Список локаций для Select в хедере (Owner с несколькими точками)
  const locations = shouldLoadLocations ? (locationsData?.locations ?? []) : [];

  // Получаем начальную дату
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getInitialDate()
  );

  // Состояние для employeeId: из URL или undefined ("all")
  const [employeeId, setEmployeeId] = useState<string | undefined>(
    () => searchParams.get("employee") ?? undefined
  );

  // Обёртка: обновляет state + URL при смене сотрудника
  const handleEmployeeIdChange = useCallback(
    (newEmployeeId: string | undefined) => {
      setEmployeeId(newEmployeeId);
      setUrlParam("employee", newEmployeeId);
    },
    [setUrlParam]
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
  // Передаем selectedLocationId для net_manager и self_owner
  const { events, masters, isError, error } = useCalendarApi({
    selectedDate,
    view: calendarView,
    locationId: selectedLocationId,
    employeeId,
  });

  // Обработка ошибок загрузки
  // Обработка ошибок загрузки (календарь + точки)
  useEffect(() => {
    const errors = [
      [isError, error, "Ошибка загрузки данных календаря"],
      [isLocationsError, locationsError, "Ошибка загрузки точек сети"],
    ] as const;
    for (const [flag, err, fallback] of errors) {
      if (flag && err) {
        toast.error(err instanceof Error ? err.message : fallback);
      }
    }
  }, [isError, error, isLocationsError, locationsError]);

  // Если точек нет (пустой массив) - показываем EmptyLocationsState
  const hasNoLocations =
    shouldLoadLocations &&
    !isLoadingLocations &&
    locationsData &&
    locationsData.locations.length === 0;

  // Для NET_MANAGER и SELF_OWNER точка обязательна - не показываем календарь без локации
  const shouldShowCalendar =
    !shouldLoadLocations || (shouldLoadLocations && selectedLocationId);

  // Показываем загрузку пока монтируется компонент или загружаются локации
  if (!isMounted || (shouldLoadLocations && isLoadingLocations)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Если точек нет - показываем EmptyLocationsState
  if (hasNoLocations) {
    return (
      <>
        <EmptyLocationsHeader />
        <EmptyLocationsState />
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
      initialEmployeeId={employeeId}
      selectedLocationId={selectedLocationId}
      onDateChange={date => {
        // Проверяем, изменилась ли дата перед обновлением
        if (format(date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")) {
          handleDateChange(date);
          setSelectedDate(date);
        }
      }}
      onEmployeeIdChange={handleEmployeeIdChange}
    >
      <DashboardHeader
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={handleLocationChange}
      />

      <DashboardContent
        calendarView={calendarView}
        handleViewChange={handleViewChange}
      />
    </CalendarProvider>
  );
}
