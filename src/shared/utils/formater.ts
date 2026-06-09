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

/**
 * Форматирование суммы в тенге с разделителями (для аналитики).
 * Пример: 1245000 → "1 245 000 ₸"
 */
export function formatTenge(amount: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(amount)) + " ₸";
}

/**
 * Форматирование процента с фиксированным числом знаков.
 * signed=true добавляет "+" перед положительным значением (для delta).
 */
export function formatPercent(
  value: number,
  digits: number = 0,
  signed: boolean = false
): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/**
 * Δ% между текущим и предыдущим значениями.
 * Возвращает null если prev=0 (деление на ноль не имеет смысла).
 */
export function calcDeltaPercent(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

/**
 * Компактное число для KPI (1234 → "1.2K", 1_245_000 → "1.2M").
 * Используется когда место ограничено (mobile/badge).
 */
export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Короткий формат для осей графиков: "10K", "1.2M".
 * Использует англоязычные суффиксы K/M — компактнее русского "тыс./млн"
 * и читается интуитивно. На YAxis это критично, чтобы метки не обрезались.
 */
export function formatAxisNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(Math.round(n));
}
