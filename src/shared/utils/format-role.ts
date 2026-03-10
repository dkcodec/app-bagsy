import { TUserRole } from "../types/user";

/** Локали, в которых доступны переводы ролей */
export type TRoleLocale = "ru" | "kz";

/**
 * Словарь названий ролей на двух языках (ru, kz).
 * Соответствует Staff.roles в messages/ru.json и messages/kz.json.
 */
const ROLE_LABELS: Record<TUserRole, { ru: string; kz: string }> = {
  owner: { ru: "Владелец", kz: "Иесі" },
  manager: { ru: "Менеджер", kz: "Менеджер" },
  staff: { ru: "Сотрудник", kz: "Қызметкер" },
};

/**
 * Возвращает название роли на выбранном языке.
 * @param role — роль из EUserRole
 * @param locale — "ru" | "kz"; при ином значении используется "ru"
 */
export function formatRole(
  role: TUserRole,
  locale: TRoleLocale | string
): string {
  const labels = ROLE_LABELS[role];
  if (!labels) return role;
  return locale === "kz" ? labels.kz : labels.ru;
}

/**
 * Возвращает название роли на обоих языках.
 * Удобно для отображения ru/kz или для кэширования.
 */
export function getRoleInLocales(role: TUserRole): { ru: string; kz: string } {
  return ROLE_LABELS[role] ?? { ru: role, kz: role };
}
