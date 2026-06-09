"use client";

import { Badge, Avatar, AvatarImage, AvatarFallback } from "@/src/entities";
import type { IEmployeeDto } from "@/src/shared/types/user";
import { useTranslations } from "next-intl";
import { getRoleKey } from "../utils/format-role";
import { EmployeeRowActions } from "./employee-row-actions";
import { cn } from "@/src/shared/utils/styles";
import { getInitials } from "@/src/shared/utils/avatar";

interface StaffTableRowProps {
  user: IEmployeeDto;
  onClick: () => void;
  isSelected: boolean;
}

/**
 * Строка сотрудника в grid-таблице (стиль как в услугах)
 * Мобилка: аватар + имя (+ роль под именем) + DropdownMenu
 * Десктоп: аватар + имя, телефон, роль, статус, DropdownMenu
 */
export function StaffTableRow({
  user,
  onClick,
  isSelected,
}: StaffTableRowProps) {
  const t = useTranslations("Staff");

  const initials = getInitials(user.first_name, user.last_name);

  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[1fr_32px] md:grid-cols-[1fr_120px_100px_90px_32px] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-b-0",
        isSelected && "bg-muted/50",
        !user.active && "opacity-50"
      )}
    >
      {/* Имя с аватаром — на мобилке роль показывается здесь */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="size-8 shrink-0">
          {user.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={user.first_name} />
          )}
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {user.first_name} {user.last_name}
          </p>
          {/* Роль под именем — только мобилка */}
          <p className="md:hidden text-xs text-muted-foreground">
            {t(`roles.${getRoleKey(user.role)}`)}
          </p>
        </div>
      </div>

      {/* Телефон — скрыт на мобилке */}
      <span className="hidden md:inline text-sm text-muted-foreground whitespace-nowrap">
        {user.phone}
      </span>

      {/* Роль — скрыта на мобилке (показана под именем) */}
      <div className="hidden md:block">
        <Badge variant="secondary" className="text-xs">
          {t(`roles.${getRoleKey(user.role)}`)}
        </Badge>
      </div>

      {/* Статус — скрыт на мобилке */}
      <div className="hidden md:block">
        <Badge
          variant={user.active ? "default" : "outline"}
          className="text-xs"
        >
          {user.active ? t("active") : t("inactive")}
        </Badge>
      </div>

      {/* DropdownMenu действий */}
      <div onClick={e => e.stopPropagation()}>
        <EmployeeRowActions employee={user} onViewProfile={onClick} />
      </div>
    </div>
  );
}
