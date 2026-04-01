"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Phone, Text, User, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/entities/button";
import { Input } from "@/src/entities/input";
import { useCalendar } from "@/src/features/calendar";
import { useCancelAppointment } from "@/src/shared/hooks/use-appointments";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/entities/dialog";

import type { IEvent } from "@/src/shared/types/calendar";
import { useTranslations } from "next-intl";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { masters } = useCalendar();
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const master = masters.find(m => m.id === event.employeeId) ?? null;
  const t = useTranslations("Dashboard.Calendar.EventDetailsDialog");

  // Состояние для отмены записи
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelAppointment = useCancelAppointment();

  const handleCancel = () => {
    cancelAppointment.mutate(
      { id: event.id, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          toast.success(t("cancelSuccess"));
          setShowCancelConfirm(false);
          setCancelReason("");
        },
        onError: () => {
          toast.error(t("cancelError"));
        },
      }
    );
  };

  // Запись уже отменена — не показываем кнопку отмены
  const isCancelled = event.status === "cancelled";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Клиент */}
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("client")}</p>
              <p className="text-sm text-muted-foreground">
                {event.customerName}
              </p>
            </div>
          </div>

          {/* Телефон клиента */}
          {event.customerPhone && (
            <div className="flex items-start gap-2">
              <Phone className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {event.customerPhone}
                </p>
              </div>
            </div>
          )}

          {/* Ответственный мастер */}
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("responsible")}</p>
              <p className="text-sm text-muted-foreground">
                {master
                  ? `${master.first_name} ${master.last_name}`
                  : event.employeeName}
              </p>
            </div>
          </div>

          {/* Дата начала */}
          <div className="flex items-start gap-2">
            <Calendar className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("startDate")}</p>
              <p className="text-sm text-muted-foreground">
                {format(startDate, "MMM d, yyyy HH:mm")}
              </p>
            </div>
          </div>

          {/* Дата окончания */}
          <div className="flex items-start gap-2">
            <Clock className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("endDate")}</p>
              <p className="text-sm text-muted-foreground">
                {format(endDate, "MMM d, yyyy HH:mm")}
              </p>
            </div>
          </div>

          {/* Комментарий */}
          {event.comment && (
            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("comment")}</p>
                <p className="text-sm text-muted-foreground">{event.comment}</p>
              </div>
            </div>
          )}

          {/* Форма подтверждения отмены */}
          {showCancelConfirm && (
            <div className="space-y-3 rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm font-medium">{t("cancelConfirm")}</p>
              <Input
                placeholder={t("cancelReasonPlaceholder")}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                disabled={cancelAppointment.isPending}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelAppointment.isPending}
                >
                  {cancelAppointment.isPending ? t("cancelling") : t("cancel")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
                  disabled={cancelAppointment.isPending}
                >
                  {t("cancelReasonPlaceholder").includes("необязательно")
                    ? "Нет"
                    : "Жоқ"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка отмены записи */}
        {!isCancelled && !showCancelConfirm && (
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowCancelConfirm(true)}
            >
              <XCircle className="mr-2 size-4" />
              {t("cancel")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
