"use client";

import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { Button } from "@/src/entities/button";
import { useDeleteService } from "@/src/shared/hooks/use-services";
import type { IServiceDto } from "@/src/shared/services/service-service";

interface DeleteServiceDialogProps {
  service: IServiceDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Колбэк после успешного удаления (закрыть drawer и т.д.) */
  onSuccess?: () => void;
}

/**
 * Диалог подтверждения удаления услуги
 */
export function DeleteServiceDialog({
  service,
  open,
  onOpenChange,
  onSuccess,
}: DeleteServiceDialogProps) {
  const t = useTranslations("Services.deleteDialog");
  const deleteMutation = useDeleteService();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(service.id);
      toast.success(t("success"));
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: service.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              t("confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
