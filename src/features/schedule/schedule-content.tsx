"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/src/entities";
import { Card, CardContent } from "@/src/entities";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useSchedulePermissions } from "@/src/shared/hooks/use-schedule-permissions";
import { useScheduleScope } from "./schedule-scope-context";
import { useMonthSchedule } from "./api/use-month-schedule";
import type { DaySchedule, MonthSchedule, ScheduleUserFlags, PointScheduleContext } from "@/src/shared/types/schedule";
import { MonthGrid } from "./ui/month-grid";
import { ScheduleEditor } from "./ui/schedule-editor";
import { SchedulePresets } from "./ui/schedule-presets";
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { useLocale } from "next-intl";
import { getDay } from "date-fns";

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

  /* Текущий пользователь: id (employee) и location_id. */
  const { data: user } = useCurrentUser();

  /* Маппинг permissions API → ScheduleUserFlags. */
  const userFlags: ScheduleUserFlags = {
    can_work: user?.permissions.can_provide_services ?? false,
    can_manage_point_schedule:
      user?.permissions.can_manage_location_schedule ?? false,
  };
  /* TODO: schedule_type заменить когда появится API локации. */
  const pointContext: PointScheduleContext = { schedule_type: "mixed" };
  const permissions = useSchedulePermissions({ userFlags, pointContext });

  const { activeScope, setActiveScope } = useScheduleScope();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  /* Определяем entityId по scope: staff → employee UUID, point → location UUID. */
  const entityId =
    activeScope === "staff" ? user?.id : user?.location_id;

  const {
    data: serverSchedule,
    save,
    isSaving,
    isLoading,
    prevMonth,
    nextMonth,
    daysInMonth,
  } = useMonthSchedule(activeScope, currentMonth, entityId);

  /* Локальный state расписания (изменения копятся здесь до нажатия "Сохранить"). */
  const [localSchedule, setLocalSchedule] =
    useState<MonthSchedule>(serverSchedule);
  const [isDirty, setIsDirty] = useState(false);

  /* Дни, авто-открытые при клике (для отката при deselect). */
  const autoOpenedDaysRef = useRef<Set<number>>(new Set());

  /* Синхронизация с сервером при загрузке / смене месяца. */
  const prevServerRef = useRef(serverSchedule);
  useEffect(() => {
    if (serverSchedule !== prevServerRef.current) {
      setLocalSchedule(serverSchedule);
      setIsDirty(false);
      prevServerRef.current = serverSchedule;
      /* Очищаем сет авто-открытых дней при смене месяца / загрузке. */
      autoOpenedDaysRef.current.clear();
    }
  }, [serverSchedule]);

  const readOnly =
    (activeScope === "staff" && permissions.isPointScheduleFixed) ||
    (activeScope === "point" && !permissions.canEditPointSchedule);

  /* Обновить локальное расписание (без сохранения на бэк). */
  const updateLocal = useCallback(
    (updater: (prev: MonthSchedule) => MonthSchedule) => {
      setLocalSchedule(prev => {
        const next = updater(prev);
        setIsDirty(true);
        return next;
      });
    },
    []
  );

  /* Выбор / отмена дня. При выборе — авто-открытие; при deselect — откат если не менялось. */
  const toggleDay = useCallback((day: number) => {
    setSelectedDays(prev => {
      const isDeselecting = prev.includes(day);
      if (isDeselecting) {
        /* Откат авто-открытого дня: возвращаем isClosed если пользователь не редактировал. */
        if (autoOpenedDaysRef.current.has(day)) {
          autoOpenedDaysRef.current.delete(day);
          setLocalSchedule(p => ({
            ...p,
            [day]: { isClosed: true, workRanges: [], breaks: [] },
          }));
        }
        return prev.filter(d => d !== day);
      }
      /* Авто-открытие: если день закрыт или не существует, ставим дефолтное расписание. */
      setLocalSchedule(p => {
        const dayData = p[day];
        if (!dayData || dayData.isClosed) {
          autoOpenedDaysRef.current.add(day);
          setIsDirty(true);
          return { ...p, [day]: { ...DEFAULT_OPEN_DAY } };
        }
        return p;
      });
      return [...prev, day].sort((a, b) => a - b);
    });
  }, []);

  /* Shift+клик — диапазон. Авто-открытие для всех новых дней. */
  const rangeSelect = useCallback(
    (from: number, to: number) => {
      const newDays = new Set(selectedDays);
      for (let d = from; d <= to; d++) newDays.add(d);
      setSelectedDays(Array.from(newDays).sort((a, b) => a - b));
      /* Авто-открытие всех закрытых дней в диапазоне. */
      setLocalSchedule(prev => {
        let changed = false;
        const next = { ...prev };
        for (let d = from; d <= to; d++) {
          if (next[d]?.isClosed) {
            next[d] = { ...DEFAULT_OPEN_DAY };
            changed = true;
          }
        }
        if (changed) setIsDirty(true);
        return changed ? next : prev;
      });
    },
    [selectedDays]
  );

  /* Применить изменение ко всем выбранным дням (локально). */
  const applyToSelected = useCallback(
    (updater: (draft: DaySchedule) => DaySchedule) => {
      /* Пользователь явно отредактировал — убираем из авто-открытых (не откатывать при deselect). */
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
      });
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
      });
    },
    [updateLocal]
  );

  /* Сохранить на бэк. */
  const handleSave = useCallback(async () => {
    await save(localSchedule);
    setIsDirty(false);
  }, [save, localSchedule]);

  /* Перейти к сегодня. */
  const goToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDays([now.getDate()]);
  }, []);

  /* Вычисляем firstDayOffset для пресета 5/2. */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstJsDay = getDay(new Date(year, month, 1)); // 0=Вс
  const firstDayOffset = firstJsDay === 0 ? 6 : firstJsDay - 1; // 0=Пн

  if (permissions.scopeOptions.length === 0) {
    return (
      <div className="p-4 text-muted-foreground text-sm">{t("noAccess")}</div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Табы: мой график / график точки */}
      {permissions.scopeOptions.length > 1 && (
        <Tabs
          value={activeScope}
          onValueChange={v => setActiveScope(v as "point" | "staff")}
        >
          <TabsList>
            <TabsTrigger value="staff">{t("mySchedule")}</TabsTrigger>
            <TabsTrigger value="point">{t("pointSchedule")}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Информер при фиксированном графике точки. */}
      {readOnly && permissions.isPointScheduleFixed && (
        <Alert className="bg-muted/50 border-muted-foreground/20">
          <AlertDescription>
            {t("Header.scheduleTypeFixedHint")}
          </AlertDescription>
        </Alert>
      )}

      {/* Навигация по месяцам */}
      <div className="flex items-center justify-between gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="h-7 text-xs"
          >
            {t("MonthNav.today")}
          </Button>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        /* Двухколоночный layout на десктопе */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
          {/* Левая колонка — календарь + пресеты */}
          <div className="flex flex-col gap-4">
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
                />
                {/* Подсказка выбора */}
                {selectedDays.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t("selectedCount", { count: selectedDays.length })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSelectedDays([])}
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
                readOnly={readOnly}
              />
            )}
          </div>

          {/* Правая колонка — редактор + кнопка сохранить */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            <Card>
              <CardContent className="pt-4">
                <ScheduleEditor
                  selectedDays={selectedDays}
                  monthSchedule={localSchedule}
                  onApplyToSelected={applyToSelected}
                  readOnly={readOnly}
                />
              </CardContent>
            </Card>

            {/* Кнопка сохранить */}
            {isDirty && !readOnly && (
              <div className="sticky bottom-4 z-10">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("save")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
