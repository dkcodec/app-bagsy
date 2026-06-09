"use client";

import { useTranslations } from "next-intl";
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
import { useUpdateLocation } from "@/src/shared/hooks/use-network-locations";

interface ToggleActiveDialogProps {
  location: ILocationDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Диалог подтверждения активации/деактивации локации
 * PUT /api/v1/locations/{id} с { active: !current }
 */
export function ToggleActiveDialog({
  location,
  open,
  onOpenChange,
}: ToggleActiveDialogProps) {
  const t = useTranslations("Locations.toggleActive");
  const updateMutation = useUpdateLocation();

  const nextActive = !location.active;

  const handleToggle = async () => {
    try {
      await updateMutation.mutateAsync({
        id: location.id,
        data: { active: nextActive },
      });
      toast.success(nextActive ? t("activateSuccess") : t("deactivateSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {nextActive ? t("activateTitle") : t("deactivateTitle")}
          </DialogTitle>
          <DialogDescription>
            {nextActive
              ? t("activateDescription", { name: location.name })
              : t("deactivateDescription", { name: location.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            variant={nextActive ? "default" : "destructive"}
            onClick={handleToggle}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : nextActive ? (
              t("activateConfirm")
            ) : (
              t("deactivateConfirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
