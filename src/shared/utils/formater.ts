import { TUserRole } from "../types/user";

/**
 * Форматирование номера телефона
 */
export function formatPhone(phone: string) {
  return phone.replace(
    /(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/,
    "+$1 ($2) $3-$4-$5"
  );
}

/**
 * Форматирование даты для отображения
 */
export function formatDate(dateString: string, locale: string = "ru-RU") {
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
