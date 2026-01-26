import {
  parseTimestamp,
  formatTimestamp,
  toTimestampWithTz,
  nowTimestampWithTz,
} from "./datetime";

// Реэкспорт для форм, DnD, хуков, schedule
export {
  toTimestampWithTz,
  nowTimestampWithTz,
  parseTimestamp,
  timeOfDayToTimestampWithTz,
  parseScheduleTime,
  formatScheduleTime,
} from "./datetime";

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
 * Форматирование даты и времени для отображения (ISO с Z или ±HH:mm → локальная дата+время).
 * Для пустой/невалидной строки — "—".
 */
export function formatDate(dateString: string, locale: string = "ru-RU") {
  if (!dateString?.trim()) return "—";
  return formatTimestamp(parseTimestamp(dateString), locale, {
    showTime: true,
  });
}

/**
 * Форматирование только даты (без времени). Для пустой/невалидной строки — "—".
 */
export function formatDateOnly(dateString: string, locale: string = "ru-RU") {
  if (!dateString?.trim()) return "—";
  return formatTimestamp(parseTimestamp(dateString), locale, {
    showTime: false,
  });
}
