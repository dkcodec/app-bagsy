"use client";

import { useTranslations } from "next-intl";
import { Drawer, DrawerContent, DrawerTitle } from "@/src/entities";

interface ScheduleBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/** Мобильный bottom sheet для редактора расписания. Vaul Drawer с handle bar. */
export function ScheduleBottomSheet({
  open,
  onOpenChange,
  children,
}: ScheduleBottomSheetProps) {
  const t = useTranslations("Schedule");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        {/* Скрытый title для a11y (Radix Dialog требует DialogTitle) */}
        <DrawerTitle className="sr-only">{t("editorTitle")}</DrawerTitle>
        <div className="overflow-y-auto px-4 pb-4 pt-2">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
