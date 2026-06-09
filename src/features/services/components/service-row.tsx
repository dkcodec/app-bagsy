"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import { AvatarGroup } from "@/src/entities/avatar-group";
import type { IServiceDto } from "@/src/shared/services/service-service";
import type { ServiceStaffMember } from "@/src/shared/hooks/user-staff";
import { ServiceRowActions } from "./service-row-actions";

interface ServiceRowProps {
  service: IServiceDto;
  staff: ServiceStaffMember[];
  /** Staff роль — скрываем мастеров и действия */
  isStaff?: boolean;
  onRowClick: () => void;
  onAssignClick: () => void;
  onEdit: () => void;
  onManageStaff: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** Форматирует длительность: 90 → "1ч 30м" */
const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}ч ${m}м`;
  if (h > 0) return `${h}ч`;
  return `${m} мин`;
};

/** Форматирует цену */
const formatPrice = (min?: number | null, max?: number | null) => {
  if (!min && !max) return null;
  if (min === max) return `${(min ?? 0).toLocaleString()} ₸`;
  return `${(min ?? 0).toLocaleString()} — ${(max ?? 0).toLocaleString()} ₸`;
};

/** Инициалы */
const getInitials = (first: string, last: string) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

/**
 * Строка услуги в grid-таблице
 */
export function ServiceRow({
  service,
  staff,
  isStaff,
  onRowClick,
  onAssignClick,
  onEdit,
  onManageStaff,
  onDuplicate,
  onDelete,
}: ServiceRowProps) {
  const t = useTranslations("Services.staffTab");
  const price = formatPrice(service.min_price, service.max_price);

  return (
    <div
      className={`grid gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0 ${isStaff ? "grid-cols-[6px_1fr_80px] md:grid-cols-[6px_1fr_90px_110px]" : "grid-cols-[6px_1fr_80px_32px] md:grid-cols-[6px_1fr_90px_110px_100px_32px]"}`}
      onClick={onRowClick}
    >
      {/* Цветная точка */}
      <div
        className="size-1.5 rounded-full"
        style={{ backgroundColor: service.color }}
      />

      {/* Название + описание */}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{service.name}</p>
        {service.description && (
          <p className="text-xs text-muted-foreground truncate">
            {service.description}
          </p>
        )}
      </div>

      {/* Длительность (скрыта на мобилке) */}
      <span className="hidden md:inline text-sm text-muted-foreground whitespace-nowrap">
        {formatDuration(service.duration_minutes)}
      </span>

      {/* Цена */}
      <span
        className={`text-sm whitespace-nowrap ${price ? "font-medium" : "text-muted-foreground"}`}
      >
        {price || t("notSet")}
      </span>

      {/* Сотрудники + действия (скрыты для staff) */}
      {!isStaff && (
        <>
          <div
            className="hidden md:flex items-center"
            onClick={e => {
              e.stopPropagation();
              onAssignClick();
            }}
          >
            {staff.length > 0 ? (
              <AvatarGroup max={3} spacing={8}>
                {staff.map(({ employee }) => (
                  <Avatar key={employee.id} className="size-6">
                    <AvatarImage
                      src={employee.avatar_url}
                      alt={`${employee.first_name} ${employee.last_name}`}
                    />
                    <AvatarFallback className="text-[9px] font-medium">
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            ) : (
              <span className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-0.5">
                <Plus className="size-3" />
                {t("assign")}
              </span>
            )}
          </div>

          <div onClick={e => e.stopPropagation()}>
            <ServiceRowActions
              onEdit={onEdit}
              onManageStaff={onManageStaff}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}
