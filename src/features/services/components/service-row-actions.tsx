"use client";

import { MoreHorizontal, Pencil, Users, Copy, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/entities/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/widgets/forms/dropdown-menu";

interface ServiceRowActionsProps {
  onEdit: () => void;
  onManageStaff: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Меню действий (⋯) для строки услуги
 */
export function ServiceRowActions({
  onEdit,
  onManageStaff,
  onDuplicate,
  onDelete,
}: ServiceRowActionsProps) {
  const t = useTranslations("Services.actions");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onManageStaff}>
          <Users className="mr-2 h-4 w-4" />
          {t("manageStaff")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          {t("duplicate")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
