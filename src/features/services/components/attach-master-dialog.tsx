"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { useTranslations } from "next-intl";
import { AttachMasterForm } from "./attach-master-form";
import { IServiceDto } from "@/src/shared/services/service-service";

interface AttachMasterDialogProps {
  /** Открыт ли диалог */
  open: boolean;
  /** Колбэк изменения состояния открытия */
  onOpenChange: (open: boolean) => void;
  /** Услуга, к которой привязывается мастер */
  service: IServiceDto;
  /** UUID локации для загрузки списка мастеров */
  locationId?: string;
}

/**
 * Диалог для привязки мастера к услуге
 * Полная форма с расширенными возможностями
 */
export function AttachMasterDialog({
  open,
  onOpenChange,
  service,
  locationId,
}: AttachMasterDialogProps) {
  const t = useTranslations("Services.attachMaster");

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription", { serviceName: service.name })}
          </DialogDescription>
        </DialogHeader>
        <AttachMasterForm
          service={service}
          locationId={locationId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
