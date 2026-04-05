"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from "@/src/entities";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useSchedulePermissions } from "@/src/shared/hooks/use-schedule-permissions";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { useScheduleScope } from "./schedule-scope-context";
import { useMonthSchedule } from "./api/use-month-schedule";
import type {
  DaySchedule,
  MonthSchedule,
  ScheduleUserFlags,
  PointScheduleContext,
} from "@/src/shared/types/schedule";
import { MonthGrid } from "./ui/month-grid";
import { ScheduleEditor } from "./ui/schedule-editor";
import { SchedulePresets } from "./ui/schedule-presets";
import { ScheduleBottomSheet } from "./ui/schedule-bottom-sheet";
import {
  ScheduleCalendarSkeleton,
  ScheduleEditorSkeleton,
} from "./ui/schedule-skeleton";
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { getDay } from "date-fns";
import { toast } from "sonner";
import type { TimeRange } from "@/src/shared/types/schedule";
import { timeToMinutes } from "@/src/shared/utils/schedule";
import { ESubscriptionPlan } from "@/src/shared/types/user";

// ============================================================
// Валидация расписания
// ============================================================

/** Два диапазона пересекаются? */
function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return (
    timeToMinutes(a.start) < timeToMinutes(b.end) &&
    timeToMinutes(b.start) < timeToMinutes(a.end)
  );
}

/** Валидация расписания. days — фильтр по конкретным дням (если не указан — все). */
function validateSchedule(
  schedule: MonthSchedule,
  days?: number[]
): string | null {
  const entries = days
    ? days.map(d => schedule[d]).filter(Boolean)
    : Object.values(schedule);
  for (const day of entries) {
    if (day.isClosed) continue;

    /* end <= start */
    for (const r of day.workRanges) {
      if (timeToMinutes(r.end) <= timeToMinutes(r.start))
        return "endBeforeStart";
    }
    for (const b of day.breaks) {
      if (timeToMinutes(b.end) <= timeToMinutes(b.start))
        return "endBeforeStart";
    }

    /* Пересечения между рабочими интервалами */
    for (let i = 0; i < day.workRanges.length; i++) {
      for (let j = i + 1; j < day.workRanges.length; j++) {
        if (rangesOverlap(day.workRanges[i], day.workRanges[j]))
          return "overlappingRanges";
      }
    }

    /* Перерыв вне рабочих часов */
    for (const b of day.breaks) {
      const bStart = timeToMinutes(b.start);
      const bEnd = timeToMinutes(b.end);
      const insideWork = day.workRanges.some(
        r => bStart >= timeToMinutes(r.start) && bEnd <= timeToMinutes(r.end)
      );
      if (!insideWork) return "breakOutsideWork";
    }

    /* Пересечения между перерывами */
    for (let i = 0; i < day.breaks.length; i++) {
      for (let j = i + 1; j < day.breaks.length; j++) {
        if (rangesOverlap(day.breaks[i], day.breaks[j]))
          return "overlappingBreaks";
      }
    }
  }
  return null;
}

/** Дефолтное расписание для нового рабочего дня. */
const DEFAULT_OPEN_DAY: DaySchedule = {
  isClosed: false,
  workRanges: [{ start: "09:00", end: "18:00" }],
  breaks: [],
};

export function ScheduleContent() {
  const t = useTranslations("Schedule");
  const locale = useLocale();
  const dateFnsLocale = locale === "kz" ? kk : ru;
  const isMobile = useIsMobile();

  /* Текущий пользователь: id (employee) и location_id. */
  const { data: user } = useCurrentUser();

  /* Маппинг permissions API → ScheduleUserFlags. */
  const userFlags: ScheduleUserFlags = {
    can_work: user?.permissions.can_provide_services ?? false,
    can_manage_point_schedule:
      user?.permissions.can_manage_location_schedule ?? false,
  };

  /* Solo plan detection. */
  const isSoloPlan =
    user?.organization?.subscription?.plan === ESubscriptionPlan.SOLO;

  /* locationId и scheduleType из контекста (для network — переключается Select'ом). */
  const { activeScope, setActiveScope, locationId, scheduleType } =
    useScheduleScope();

  const pointContext: PointScheduleContext = { schedule_type: scheduleType };
  const permissions = useSchedulePermissions({
    userFlags,
    pointContext,
    isSoloPlan,
  });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* Для fixed + staff scope: показываем расписание точки, а не сотрудника. */
  const isFixedStaffView =
    activeScope === "staff" && permissions.isPointScheduleFixed;

  /* Определяем entityId по scope. Fixed staff → подставляем location_id. */
  const entityId = useMemo(() => {
    if (isFixedStaffView) return locationId;
    return activeScope === "staff" ? user?.id : locationId;
  }, [activeScope, isFixedStaffView, user?.id, locationId]);

  /* Для fixed staff — scope запроса = "point" (грузим расписание точки). */
  const fetchScope = isFixedStaffView ? "point" : activeScope;

  const {
    data: serverSchedule,
    dataUpdatedAt,
    save,
    isSaving,
    isLoading,
    prevMonth,
    nextMonth,
    daysInMonth,
  } = useMonthSchedule(fetchScope, currentMonth, entityId);

  /* Дополнительный fetch расписания точки для mixed staff (для badge "своё"). */
  const { data: locationScheduleData } = useMonthSchedule(
    "point",
    currentMonth,
    /* Только если mixed staff scope */
    activeScope === "staff" && !permissions.isPointScheduleFixed
      ? locationId
      : undefined
  );

  /* Локальный state расписания (изменения копятся здесь до нажатия "Сохранить"). */
  const [localSchedule, setLocalSchedule] =
    useState<MonthSchedule>(serverSchedule);

  /* Трекинг изменённых дней — только они отправляются на бэк. */
  const dirtyDaysRef = useRef<Set<number>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback((days: number[]) => {
    days.forEach(d => dirtyDaysRef.current.add(d));
    setIsDirty(true);
  }, []);
  const clearDirty = useCallback(() => {
    dirtyDaysRef.current.clear();
    setIsDirty(false);
  }, []);

  /* Дни, авто-открытые при клике (для отката при deselect). */
  const autoOpenedDaysRef = useRef<Set<number>>(new Set());

  /* Синхронизация с сервером при загрузке / смене месяца / смене локации.
     dataUpdatedAt — числовой timestamp из React Query, меняется только при реальном обновлении. */
  useEffect(() => {
    setLocalSchedule(serverSchedule);
    clearDirty();
    autoOpenedDaysRef.current.clear();
    setSelectedDays([]);
    if (isMobile) setSheetOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, dataUpdatedAt]);

  const readOnly =
    isFixedStaffView ||
    (activeScope === "point" && !permissions.canEditPointSchedule);

  /* Обновить локальное расписание (без сохранения на бэк). */
  const updateLocal = useCallback(
    (updater: (prev: MonthSchedule) => MonthSchedule, days?: number[]) => {
      setLocalSchedule(prev => {
        const next = updater(prev);
        /* Трекаем изменённые дни. */
        if (days) markDirty(days);
        return next;
      });
    },
    [markDirty]
  );

  /* Выбор / отмена дня. При выборе — авто-открытие; при deselect — откат. */
  const toggleDay = useCallback(
    (day: number) => {
      setSelectedDays(prev => {
        const isDeselecting = prev.includes(day);
        if (isDeselecting) {
          if (autoOpenedDaysRef.current.has(day)) {
            autoOpenedDaysRef.current.delete(day);
            setLocalSchedule(p => ({
              ...p,
              [day]: { isClosed: true, workRanges: [], breaks: [] },
            }));
          }
          const next = prev.filter(d => d !== day);
          /* На мобилке закрываем sheet если ничего не осталось */
          if (next.length === 0 && isMobile) setSheetOpen(false);
          return next;
        }
        /* Авто-открытие закрытого дня. */
        setLocalSchedule(p => {
          const dayData = p[day];
          if (!dayData || dayData.isClosed) {
            autoOpenedDaysRef.current.add(day);
            markDirty([day]);
            return { ...p, [day]: { ...DEFAULT_OPEN_DAY } };
          }
          return p;
        });
        /* На мобилке открываем sheet при выборе дня */
        if (isMobile) setSheetOpen(true);
        return [...prev, day].sort((a, b) => a - b);
      });
    },
    [isMobile]
  );

  /* Shift+клик — диапазон. Авто-открытие + трекинг для отката. */
  const rangeSelect = useCallback(
    (from: number, to: number) => {
      const newDays = new Set(selectedDays);
      for (let d = from; d <= to; d++) newDays.add(d);
      setSelectedDays(Array.from(newDays).sort((a, b) => a - b));
      setLocalSchedule(prev => {
        let changed = false;
        const changedDays: number[] = [];
        const next = { ...prev };
        for (let d = from; d <= to; d++) {
          if (next[d]?.isClosed) {
            next[d] = { ...DEFAULT_OPEN_DAY };
            autoOpenedDaysRef.current.add(d);
            changedDays.push(d);
            changed = true;
          }
        }
        if (changed) markDirty(changedDays);
        return changed ? next : prev;
      });
    },
    [selectedDays]
  );

  /* Применить изменение ко всем выбранным дням (локально). */
  const applyToSelected = useCallback(
    (updater: (draft: DaySchedule) => DaySchedule) => {
      selectedDays.forEach(day => autoOpenedDaysRef.current.delete(day));
      updateLocal(prev => {
        const next = { ...prev };
        selectedDays.forEach(day => {
          const draft = next[day] ?? {
            isClosed: true,
            workRanges: [],
            breaks: [],
          };
          next[day] = updater(draft);
        });
        return next;
      }, selectedDays);
    },
    [selectedDays, updateLocal]
  );

  /* Применить расписание к конкретным дням (для пресетов). */
  const applyToDays = useCallback(
    (days: number[], schedule: DaySchedule) => {
      updateLocal(prev => {
        const next = { ...prev };
        days.forEach(day => {
          next[day] = { ...schedule };
        });
        return next;
      }, days);
    },
    [updateLocal]
  );

  /* Сбросить выделение + откатить все несохранённые изменения к серверному состоянию. */
  const clearSelection = useCallback(() => {
    setLocalSchedule(serverSchedule);
    clearDirty();
    autoOpenedDaysRef.current.clear();
    setSelectedDays([]);
    if (isMobile) setSheetOpen(false);
  }, [isMobile, serverSchedule, clearDirty]);

  /* Сохранить на бэк с валидацией (только изменённые дни). */
  const handleSave = useCallback(async () => {
    const dirty = Array.from(dirtyDaysRef.current);
    const error = validateSchedule(
      localSchedule,
      dirty.length > 0 ? dirty : undefined
    );
    if (error) {
      toast.error(t(`Editor.${error}`));
      return;
    }
    try {
      await save(localSchedule, dirty.length > 0 ? dirty : undefined);
      clearDirty();
      autoOpenedDaysRef.current.clear();
      toast.success(t("savedSuccess"));
    } catch {
      toast.error(t("savedError"));
    }
  }, [save, localSchedule, t, clearDirty]);

  /* Пометить выбранные дни выходными и сразу сохранить (атомарно). */
  const handleMarkDayOff = useCallback(async () => {
    const updated = { ...localSchedule };
    selectedDays.forEach(day => {
      updated[day] = { isClosed: true, workRanges: [], breaks: [] };
    });
    setLocalSchedule(updated);
    try {
      await save(updated, selectedDays);
      clearDirty();
      autoOpenedDaysRef.current.clear();
      toast.success(t("dayOffSuccess"));
    } catch {
      toast.error(t("savedError"));
    }
  }, [localSchedule, selectedDays, save, t, clearDirty]);

  /* Перейти к сегодня. */
  const goToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDays([now.getDate()]);
  }, []);

  /* Смещение первого дня для пресетов. */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstJsDay = getDay(new Date(year, month, 1));
  const firstDayOffset = firstJsDay === 0 ? 6 : firstJsDay - 1;

  /* Нет доступа */
  if (permissions.scopeOptions.length === 0) {
    return (
      <div className="p-4 text-muted-foreground text-sm">{t("noAccess")}</div>
    );
  }

  /* Общий editor props */
  const editorElement = (
    <ScheduleEditor
      selectedDays={selectedDays}
      monthSchedule={localSchedule}
      onApplyToSelected={applyToSelected}
      readOnly={readOnly}
      currentMonth={currentMonth}
      locationSchedule={activeScope === "staff" ? locationScheduleData : null}
      onSave={handleSave}
      onMarkDayOff={handleMarkDayOff}
      isSaving={isSaving}
      isDirty={isDirty}
    />
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Табы: мой график / график точки (скрыты для solo) */}
      {!permissions.isSoloPlan && permissions.scopeOptions.length > 1 && (
        <Tabs
          value={activeScope}
          onValueChange={v => setActiveScope(v as "point" | "staff")}
        >
          <TabsList>
            <TabsTrigger value="point">{t("pointSchedule")}</TabsTrigger>
            <TabsTrigger value="staff">{t("mySchedule")}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Информер при фиксированном графике (staff tab). */}
      {isFixedStaffView && (
        <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
            {t("fixedScheduleInfo")}
          </AlertDescription>
        </Alert>
      )}

      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(prevMonth)}
            aria-label={t("MonthNav.prev")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold capitalize tabular-nums">
              {format(currentMonth, "LLLL yyyy", { locale: dateFnsLocale })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(nextMonth)}
            aria-label={t("MonthNav.next")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToday}
          className="h-7 text-xs"
        >
          {t("MonthNav.today")}
        </Button>
      </div>

      {isLoading ? (
        /* Скелетоны при загрузке */
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start">
          <ScheduleCalendarSkeleton />
          {!isMobile && <ScheduleEditorSkeleton />}
        </div>
      ) : (
        /* Основной layout */
        <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4 items-start">
          {/* Левая колонка — календарь + пресеты */}
          <div className="flex flex-col gap-3">
            <Card>
              <CardContent className="pt-4">
                <MonthGrid
                  currentMonth={currentMonth}
                  daysInMonth={daysInMonth}
                  selectedDays={selectedDays}
                  monthSchedule={localSchedule}
                  onToggleDay={toggleDay}
                  onRangeSelect={rangeSelect}
                  readOnly={readOnly}
                  isMobile={isMobile}
                />
                {/* Счётчик выбранных + сброс */}
                {selectedDays.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t("selectedCount", { count: selectedDays.length })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={clearSelection}
                    >
                      {t("clearSelection")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Пресеты — под календарём */}
            {!readOnly && (
              <SchedulePresets
                selectedDays={selectedDays}
                daysInMonth={daysInMonth}
                firstDayOffset={firstDayOffset}
                monthSchedule={localSchedule}
                onApplyToSelected={applyToSelected}
                onApplyToDays={applyToDays}
                onSelectDays={setSelectedDays}
                onMarkAutoOpened={days =>
                  days.forEach(d => autoOpenedDaysRef.current.add(d))
                }
                readOnly={readOnly}
                isMobile={isMobile}
                onAfterPreset={isMobile ? () => setSheetOpen(true) : undefined}
              />
            )}
          </div>

          {/* Правая колонка — десктоп: Card, мобилка: bottom sheet */}
          {isMobile ? (
            <ScheduleBottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
              {editorElement}
            </ScheduleBottomSheet>
          ) : (
            <div className="flex flex-col gap-4 sticky top-20">
              <Card>
                <CardContent className="pt-4">{editorElement}</CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
