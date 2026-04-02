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
import { useRemoveMasterService } from "@/src/shared/hooks/use-master-services";

interface UnlinkStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeServiceId: string;
  employeeName: string;
  serviceName: string;
}

/**
 * Диалог подтверждения отвязки сотрудника от услуги
 */
export function UnlinkStaffDialog({
  open,
  onOpenChange,
  employeeServiceId,
  employeeName,
  serviceName,
}: UnlinkStaffDialogProps) {
  const t = useTranslations("Services.staffTab");
  const removeMutation = useRemoveMasterService();

  const handleUnlink = async () => {
    try {
      await removeMutation.mutateAsync(employeeServiceId);
      toast.success(t("unlinkSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("unlinkError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("unlinkTitle")}</DialogTitle>
          <DialogDescription>
            {t("unlinkDescription", { name: employeeName, service: serviceName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={removeMutation.isPending}
          >
            {t("unlinkCancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnlink}
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              t("unlinkConfirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
