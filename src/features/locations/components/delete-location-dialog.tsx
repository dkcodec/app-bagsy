"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/entities/dialog";
import { Button } from "@/src/entities/button";
import type { ILocationDto } from "@/src/shared/services/location-service";
import { useDeleteLocation } from "@/src/shared/hooks/use-network-locations";

interface DeleteLocationDialogProps {
  location: ILocationDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Диалог подтверждения удаления локации
 * Показывает название локации и предупреждение о необратимости
 */
export function DeleteLocationDialog({
  location,
  open,
  onOpenChange,
}: DeleteLocationDialogProps) {
  const t = useTranslations("Locations.detail");
  const locale = useLocale();
  const router = useRouter();
  const deleteMutation = useDeleteLocation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(location.id);
      toast.success(t("deleteSuccess"));
      onOpenChange(false);
      // После удаления — переход на список локаций
      router.push(`/${locale}/locations`);
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteDescription", { name: location.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t("deleteCancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              t("deleteConfirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
