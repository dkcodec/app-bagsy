"use client";

import { useCallback, useState } from "react";
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
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import {
  ChangeBadgeVariantInput,
  ChangeWorkingHoursInput,
  ChangeVisibleHoursInput,
} from "@/src/features/calendar/settings";
import type {
  TBadgeVariant,
  TWorkingHours,
  TVisibleHours,
} from "@/src/shared/types/calendar";

export function CalendarSettings() {
  const t = useTranslations("Dashboard.Settings");
  const { badgeVariant, setBadgeVariant, setWorkingHours, setVisibleHours } =
    useCalendar();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);

  // Локальные состояния для временного хранения изменений
  const [tempBadgeVariant, setTempBadgeVariant] =
    useState<TBadgeVariant | null>(null);
  const [tempWorkingHours, setTempWorkingHours] =
    useState<TWorkingHours | null>(null);
  const [tempVisibleHours, setTempVisibleHours] =
    useState<TVisibleHours | null>(null);

  // Обработчик сохранения всех настроек
  const handleSave = () => {
    // Применяем все временные изменения
    if (tempBadgeVariant) {
      setBadgeVariant(tempBadgeVariant);
    }
    if (tempWorkingHours) {
      setWorkingHours(tempWorkingHours);
    }
    if (tempVisibleHours) {
      setVisibleHours(tempVisibleHours);
    }

    // Закрываем диалог
    setIsOpen(false);
    setTempBadgeVariant(null);
    setTempWorkingHours(null);
    setTempVisibleHours(null);
  };

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setTempBadgeVariant(null);
    setTempWorkingHours(null);
    setTempVisibleHours(null);
  }, [setTempBadgeVariant, setTempWorkingHours, setTempVisibleHours]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        {/* Содержимое настроек */}
        <div className={`space-y-6 ${isMobile ? "py-2" : "py-4"}`}>
          <ChangeWorkingHoursInput
            onWorkingHoursChange={setTempWorkingHours}
            isMobile={isMobile}
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
            onClick={handleSave}
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
