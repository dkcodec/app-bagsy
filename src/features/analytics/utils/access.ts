/**
 * Правила доступа к разделу аналитики.
 * Единый источник правды для табов в шапке, гарда страниц и smart-redirect.
 */

import type { IEmployeeDto, TSubscriptionPlan } from "@/src/shared/types/user";
import { EUserRole } from "@/src/shared/types/user";
import type { TAnalyticsTab } from "../constants";

export interface IAnalyticsAccess {
  /** Какие табы видны в шапке. */
  allowedTabs: TAnalyticsTab[];
  /** Куда вести при заходе на /analytics. */
  defaultTab: TAnalyticsTab;
  /** Поддоступ "видеть чужую аналитику" (мастера/локации/финансы/клиенты). */
  hasManagerScope: boolean;
  /** Видеть несколько локаций и общую сводку (Network Owner). */
  hasNetworkScope: boolean;
  /** План подписки — для UI-веток (например для Solo скрываем топ-мастеров). */
  plan: TSubscriptionPlan;
}

/**
 * Вычислить доступ по текущему пользователю.
 * Solo Owner и любой Staff видят только свою личную аналитику.
 * Manager/Owner на Point и выше — всё по своей локации.
 * Owner на Network — + табы "Локации" со сводкой по всем точкам.
 */
export function getAnalyticsAccess(user?: IEmployeeDto): IAnalyticsAccess {
  // Безопасные дефолты если пользователь ещё не загружен
  const plan = (user?.organization?.subscription?.plan ??
    "solo") as TSubscriptionPlan;
  const role = user?.role ?? EUserRole.STAFF;

  // Solo Owner = единственный мастер: показываем только "Моя"
  const isSoloOwner = role === EUserRole.OWNER && plan === "solo";
  const isStaff = role === EUserRole.STAFF;

  if (isSoloOwner || isStaff) {
    return {
      allowedTabs: ["me"],
      defaultTab: "me",
      hasManagerScope: false,
      hasNetworkScope: false,
      plan,
    };
  }

  // Network Owner получает дополнительный таб "Локации"
  const isNetworkOwner = role === EUserRole.OWNER && plan === "network";

  const tabs: TAnalyticsTab[] = ["overview", "staff"];
  if (isNetworkOwner) tabs.push("locations");
  tabs.push("finance", "clients");

  return {
    allowedTabs: tabs,
    defaultTab: "overview",
    hasManagerScope: true,
    hasNetworkScope: isNetworkOwner,
    plan,
  };
}

/**
 * Проверка доступа к конкретному табу — для гарда страницы.
 */
export function canAccessTab(
  access: IAnalyticsAccess,
  tab: TAnalyticsTab
): boolean {
  return access.allowedTabs.includes(tab);
}
