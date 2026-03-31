"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/entities/button";
import { Input } from "@/src/entities/input";
import { Skeleton } from "@/src/entities/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import { useCreateMasterService } from "@/src/shared/hooks/use-master-services";
import { EUserRole, type TUserRole } from "@/src/shared/types/user";
import type { IServiceDto } from "@/src/shared/services/service-service";
import type { ServiceStaffMember } from "@/src/shared/hooks/user-staff";

interface ServiceStaffTabProps {
  service: IServiceDto;
  locationId: string;
  /** Уже привязанные сотрудники (из staffMap) */
  assignedStaff: ServiceStaffMember[];
}

/** Инициалы для аватара */
const getInitials = (first: string, last: string) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

/**
 * Таб "Сотрудники" — assigned + available списки
 */
export function ServiceStaffTab({
  service,
  locationId,
  assignedStaff,
}: ServiceStaffTabProps) {
  const t = useTranslations("Services.staffTab");
  const createMasterService = useCreateMasterService();

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  // Все сотрудники локации
  const employeesParams = useMemo(() => {
    if (!locationId) return undefined;
    return {
      role: [
        EUserRole.STAFF,
        EUserRole.MANAGER,
        EUserRole.OWNER,
      ] as TUserRole[],
      location_id: locationId,
    };
  }, [locationId]);

  const { data: employeesData, isLoading } = useGetEmployees(employeesParams);

  // IDs привязанных сотрудников
  const assignedIds = useMemo(
    () => new Set(assignedStaff.map(s => s.employee.id)),
    [assignedStaff]
  );

  // Доступные = все сотрудники минус привязанные, owner только если can_provide_services
  const availableEmployees = useMemo(() => {
    const list = employeesData?.employees || [];
    return list.filter(
      emp =>
        !assignedIds.has(emp.id) &&
        (emp.role !== EUserRole.OWNER || emp.permissions?.can_provide_services)
    );
  }, [employeesData, assignedIds]);

  const handleAdd = async (employeeId: string) => {
    const price = prices[employeeId];
    if (!price || Number(price) <= 0) {
      toast.error(t("pricePlaceholder"));
      return;
    }
    setAddingId(employeeId);
    try {
      await createMasterService.mutateAsync({
        service_id: service.id,
        employee_id: employeeId,
        price,
      });
      toast.success(t("addSuccess"));
      setPrices(prev => ({ ...prev, [employeeId]: "" }));
    } catch {
      toast.error(t("addError"));
    } finally {
      setAddingId(null);
    }
  };

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (!min && !max) return t("notSet");
    if (min === max) return `${(min ?? 0).toLocaleString()} ₸`;
    return `${(min ?? 0).toLocaleString()} — ${(max ?? 0).toLocaleString()} ₸`;
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}ч ${m}м`;
    if (h > 0) return `${h}ч`;
    return `${m} мин`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Привязанные сотрудники */}
      {assignedStaff.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {t("assigned")} ({assignedStaff.length})
          </p>
          <div className="border rounded-md divide-y">
            {assignedStaff.map(({ employee, price }) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage
                      src={employee.avatar_url}
                      alt={`${employee.first_name} ${employee.last_name}`}
                    />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      {employee.first_name} {employee.last_name[0]}.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {price.toLocaleString()} ₸
                    </p>
                  </div>
                </div>
                {/* TODO: Remove button — эндпоинт скоро появится */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Доступные сотрудники */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">{t("available")}</p>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : availableEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noStaff")}</p>
        ) : (
          <div className="border rounded-md divide-y">
            {availableEmployees.map(emp => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage
                      src={emp.avatar_url}
                      alt={`${emp.first_name} ${emp.last_name}`}
                    />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(emp.first_name, emp.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {emp.first_name} {emp.last_name[0]}.
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    placeholder={t("pricePlaceholder")}
                    className="w-20 h-7 text-xs text-right"
                    value={prices[emp.id] || ""}
                    onChange={e =>
                      setPrices(prev => ({ ...prev, [emp.id]: e.target.value }))
                    }
                    min={1}
                  />
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3"
                    disabled={addingId === emp.id}
                    onClick={() => handleAdd(emp.id)}
                  >
                    {addingId === emp.id ? (
                      <Loader className="size-3 animate-spin" />
                    ) : (
                      t("add")
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Сводка */}
      <div className="bg-muted/50 rounded-md p-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("priceRange")}</span>
          <span className="font-medium text-foreground">
            {formatPrice(service.min_price, service.max_price)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{t("duration")}</span>
          <span className="text-foreground">
            {formatDuration(service.duration_minutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
