import { TUserRole } from "@/src/shared/types/user";

/**
 * Форматирование роли для отображения
 * Использует переводы из next-intl
 */
export function getRoleKey(role: TUserRole): string {
  const roleMap: Record<TUserRole, string> = {
    staff: "staff",
    manager: "manager",
    net_manager: "net_manager",
    self_owner: "self_owner",
    admin: "admin",
  };
  return roleMap[role] || role;
}
