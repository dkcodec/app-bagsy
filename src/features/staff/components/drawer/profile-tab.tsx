"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge, Button, Skeleton } from "@/src/entities";
import { Switch } from "@/src/entities/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/entities/dialog";
import { ESubscriptionPlan, type IEmployeeDto } from "@/src/shared/types/user";
import { useLocation } from "@/src/shared/hooks/use-network-locations";
import {
  useChangeEmployeePermissions,
  useActivateEmployee,
  useDeactivateEmployee,
} from "@/src/shared/hooks/user-staff";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { formatDate } from "@/src/shared/utils/formater";

interface ProfileTabProps {
  employee: IEmployeeDto;
}

/**
 * Таб «Профиль» — инфо, права, быстрая статистика, действия
 */
export function ProfileTab({ employee }: ProfileTabProps) {
  const td = useTranslations("Staff.drawer");
  const locale = useLocale();
  const { data: currentUser } = useCurrentUser();
  const isSoloPlan =
    currentUser?.organization?.subscription?.plan === ESubscriptionPlan.SOLO;
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";

  // Resolve location name
  const { data: location, isLoading: locationLoading } = useLocation(
    employee.location_id
  );

  // Мутации
  const permissionsMutation = useChangeEmployeePermissions();
  const activateMutation = useActivateEmployee();
  const deactivateMutation = useDeactivateEmployee();

  // Toggle permission
  const handlePermissionToggle = (
    key: "can_provide_services" | "can_manage_location_schedule",
    checked: boolean
  ) => {
    permissionsMutation.mutate({
      id: employee.id,
      permissions: {
        ...employee.permissions,
        [key]: checked,
      },
    });
  };

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Activate/Deactivate с закрытием модалки
  const handleConfirmedToggle = () => {
    if (employee.active) {
      deactivateMutation.mutate(employee.id, {
        onSuccess: () => setConfirmOpen(false),
      });
    } else {
      activateMutation.mutate(employee.id, {
        onSuccess: () => setConfirmOpen(false),
      });
    }
  };

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Информация */}
      <section>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {td("info")}
        </p>
        <div className="space-y-0">
          <InfoRow label={td("phone")} value={employee.phone} />
          <InfoRow
            label={td("location")}
            value={
              locationLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                location?.name || employee.location_id
              )
            }
          />
          <InfoRow
            label={td("status")}
            value={
              <Badge
                variant={employee.active ? "default" : "outline"}
                className={`text-xs ${!isSoloPlan ? "cursor-pointer hover:opacity-80" : ""}`}
                onClick={!isSoloPlan ? () => setConfirmOpen(true) : undefined}
              >
                {employee.active ? td("activate") : td("deactivate")}
              </Badge>
            }
          />
          <InfoRow
            label={td("joined")}
            value={formatDate(employee.created_at, dateLocale)}
          />
        </div>
      </section>

      {/* Права доступа */}
      <section>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {td("permissions")}
        </p>
        <div className="space-y-0">
          <PermissionRow
            label={td("canProvideServices")}
            description={td("canProvideServicesDesc")}
            checked={employee.permissions?.can_provide_services ?? false}
            onCheckedChange={v =>
              handlePermissionToggle("can_provide_services", v)
            }
            disabled={permissionsMutation.isPending}
          />
          <PermissionRow
            label={td("canManageSchedule")}
            description={td("canManageScheduleDesc")}
            checked={
              employee.permissions?.can_manage_location_schedule ?? false
            }
            onCheckedChange={v =>
              handlePermissionToggle("can_manage_location_schedule", v)
            }
            disabled={permissionsMutation.isPending}
          />
        </div>
      </section>

      {/* Быстрая статистика — плейсхолдер */}
      <section>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {td("quickStats")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard value="—" label={td("servicesCount")} />
          <StatCard value="—" label={td("thisWeek")} />
          <StatCard value="—" label={td("rating")} />
        </div>
      </section>

      {/* Модалка подтверждения активации/деактивации */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {employee.active ? td("deactivateTitle") : td("activateTitle")}
            </DialogTitle>
            <DialogDescription>
              {employee.active ? td("deactivateDesc") : td("activateDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {td("cancel")}
            </Button>
            <Button
              variant={employee.active ? "destructive" : "default"}
              onClick={handleConfirmedToggle}
              disabled={
                activateMutation.isPending || deactivateMutation.isPending
              }
            >
              {td("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Строка информации — label: value */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

/** Строка permission с toggle */
function PermissionRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b last:border-b-0">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

/** Карточка статистики */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-muted rounded-md p-2 text-center">
      <p className="text-lg font-medium">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
