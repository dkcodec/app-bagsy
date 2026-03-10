"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { useTranslations } from "next-intl";
import { AddServiceForm } from "./add-service-form";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** UUID локации */
  locationId: string | undefined;
}

/**
 * Диалог для добавления новой услуги
 * Содержит форму с валидацией и компонентом выбора категории/подкатегории
 */
export function AddServiceDialog({
  open,
  onOpenChange,
  locationId,
}: AddServiceDialogProps) {
  const t = useTranslations("Services.addServiceDialog");

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <AddServiceForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          locationId={locationId}
        />
      </DialogContent>
    </Dialog>
  );
}
