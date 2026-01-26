"use client";

import { useCallback, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "@/src/entities/dialog";
import { Save, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/entities/button";
import { useCalendar } from "@/src/features/calendar/calendar-context";
import { mapPointScheduleToWorkingHours } from "@/src/features/calendar/calendar-context/store";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import {
  useCurrentUser,
  useUpdateSchedule,
} from "@/src/shared/hooks/use-users";
import {
  timeOfDayToTimestampWithTz,
  parseScheduleTime,
} from "@/src/shared/utils/formater";
import { ChangeBadgeVariantInput } from "./change-badge-variant-input";
import { ChangeVisibleHoursInput } from "./change-visible-hours-input";
import { ScheduleEditor } from "@/src/features/points/components/schedule-editor";
import type { TBadgeVariant, TVisibleHours } from "@/src/shared/types/calendar";
import type { ISchedule } from "@/src/shared/types/user";
import { toast } from "sonner";

export function CalendarSettings() {
  const t = useTranslations("Dashboard.Settings");
  const { badgeVariant, setBadgeVariant, setWorkingHours, setVisibleHours } =
    useCalendar();
  const { data: currentUser } = useCurrentUser();
  const updateScheduleMutation = useUpdateSchedule();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);

  // Локальные состояния для временного хранения изменений
  const [tempBadgeVariant, setTempBadgeVariant] =
    useState<TBadgeVariant | null>(null);
  const [tempSchedule, setTempSchedule] = useState<ISchedule[] | null>(null);
  const [tempVisibleHours, setTempVisibleHours] =
    useState<TVisibleHours | null>(null);

  // При открытии диалога — подставляем расписание пользователя
  useEffect(() => {
    if (isOpen) setTempSchedule(currentUser?.schedule ?? []);
  }, [isOpen, currentUser?.schedule]);

  // Обработчик сохранения: расписание в API, badge/visible — в контекст
  const handleSave = useCallback(async () => {
    // 1. Применяем badge и visible hours в контекст (как раньше)
    if (tempBadgeVariant) setBadgeVariant(tempBadgeVariant);
    if (tempVisibleHours) setVisibleHours(tempVisibleHours);

    // 2. Сохраняем расписание в API
    const toSave = tempSchedule ?? currentUser?.schedule ?? [];
    const isValid =
      toSave.length >= 1 && toSave.some(s => s.all_day || (s.open && s.close));
    if (!isValid) {
      toast.error(t("scheduleMin"));
      return;
    }

    const schedule = toSave.map(s => {
      if (s.all_day) {
        return {
          week_day: s.week_day,
          from: timeOfDayToTimestampWithTz(0, 0),
          to: timeOfDayToTimestampWithTz(23, 59),
          all_day: s.all_day,
          comment: s.comment || "",
        };
      }
      const from = parseScheduleTime(s.open || "09:00");
      const to = parseScheduleTime(s.close || "18:00");
      return {
        week_day: s.week_day,
        from: timeOfDayToTimestampWithTz(from.hour, from.minute),
        to: timeOfDayToTimestampWithTz(to.hour, to.minute),
        all_day: s.all_day,
        comment: s.comment || "",
      };
    });

    try {
      await updateScheduleMutation.mutateAsync({ schedule });
      setWorkingHours(mapPointScheduleToWorkingHours(toSave));
      toast.success(t("scheduleSaved"));
      setIsOpen(false);
      setTempSchedule(null);
      setTempBadgeVariant(null);
      setTempVisibleHours(null);
    } catch {
      toast.error(t("scheduleSaveError"));
    }
  }, [
    tempBadgeVariant,
    tempVisibleHours,
    tempSchedule,
    currentUser?.schedule,
    t,
    setBadgeVariant,
    setVisibleHours,
    setWorkingHours,
    updateScheduleMutation,
  ]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setTempBadgeVariant(null);
    setTempSchedule(null);
    setTempVisibleHours(null);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTempSchedule(null);
      setTempBadgeVariant(null);
      setTempVisibleHours(null);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {t("settings")}
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${
          isMobile ? "w-[95vw] max-w-none h-[90vh] " : "max-h-[80vh]"
        } overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : ""}>
            {t("calendarSettings")}
          </DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
            {t("setYourSettings")}
          </DialogDescription>
        </DialogHeader>

        {/* Содержимое: расписание (API) + badge + видимые часы */}
        <div className={`space-y-6 ${isMobile ? "py-2" : "py-4"}`}>
          <ScheduleEditor
            value={tempSchedule ?? currentUser?.schedule ?? []}
            onChange={s => setTempSchedule(s)}
            isMobile={isMobile}
            title={t("myScheduleTitle")}
          />
          <ChangeBadgeVariantInput
            onBadgeVariantChange={setTempBadgeVariant}
            badgeVariant={tempBadgeVariant || badgeVariant}
            isMobile={isMobile}
          />
          <ChangeVisibleHoursInput
            onVisibleHoursChange={setTempVisibleHours}
            isMobile={isMobile}
          />
        </div>

        {/* Кнопки действий */}
        <DialogFooter className={`gap-2 ${isMobile ? "flex-col" : ""}`}>
          <Button
            variant="outline"
            onClick={handleCancel}
            className={isMobile ? "w-full" : ""}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={updateScheduleMutation.isPending}
            className={`flex items-center gap-2 ${isMobile ? "w-full" : ""}`}
          >
            <Save className="h-4 w-4" />
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
