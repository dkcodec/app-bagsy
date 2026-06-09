import { TUserRole } from "@/src/shared/types/user";

/**
 * Форматирование роли для отображения
 * Использует переводы из next-intl
 */
export function getRoleKey(role: TUserRole): string {
  const roleMap: Record<TUserRole, string> = {
    owner: "owner",
    manager: "manager",
    staff: "staff",
  };
  return roleMap[role] || role;
}
