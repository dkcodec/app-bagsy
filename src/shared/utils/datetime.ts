import { parseISO } from "date-fns";

/**
 * Формирует ISO 8601 с явным смещением таймзоны пользователя.
 * Используется при отправке start_at, end_at, updated_at на бэкенд,
 * чтобы бэк знал, в какой таймзоне сделано изменение.
 * @example "2025-01-25T14:00:00.000+05:00"
 */
export function toTimestampWithTz(d: Date): string {
  const y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const H = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  return `${y}-${M}-${D}T${H}:${mi}:${s}.${ms}${sign}${oh}:${om}`;
}

/** Текущий момент в формате ISO 8601 с таймзоной (для updated_at и аналогов). */
export function nowTimestampWithTz(): string {
  return toTimestampWithTz(new Date());
}

/**
 * Парсит ISO 8601 (с Z или ±HH:mm) в Date.
 * С бэка поля *_at, start_at, end_at всегда приходят в этом формате.
 */
export function parseTimestamp(iso: string): Date {
  return parseISO(iso);
}

/**
 * Форматирование timestamp для UI.
 * @param showTime — по умолчанию true (дата + время).
 * Для невалидной даты возвращает "—".
 */
export function formatTimestamp(
  d: Date,
  locale: string,
  opts?: { showTime?: boolean }
): string {
  if (isNaN(d.getTime())) return "—";
  const showTime = opts?.showTime !== false;
  return showTime
    ? d.toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
}

/**
 * Время суток (HH:mm) в ISO 8601 с таймзоной для schedule (from/to, open/close).
 * Используется опорная дата 1970-01-01; бэк получает время и offset.
 * @example timeOfDayToTimestampWithTz(9, 0) → "1970-01-01T09:00:00.000+05:00"
 */
export function timeOfDayToTimestampWithTz(
  hour: number,
  minute: number
): string {
  return toTimestampWithTz(new Date(1970, 0, 1, hour, minute, 0, 0));
}

/**
 * Парсит время из schedule. С бэка всегда приходит ISO 8601 с таймзоной;
 * ветка "HH:mm" — для локального состояния формы (до отправки) и краевых случаев.
 * Для пустой/невалидной строки — { hour: 0, minute: 0 }.
 */
export function parseScheduleTime(s: string): { hour: number; minute: number } {
  if (!s?.trim()) return { hour: 0, minute: 0 };
  const isIso =
    s.includes("T") ||
    /^\d{4}-\d{2}-\d{2}/.test(s) ||
    s.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(s);
  if (isIso) {
    try {
      const d = parseTimestamp(s);
      if (isNaN(d.getTime())) return { hour: 0, minute: 0 };
      return { hour: d.getHours(), minute: d.getMinutes() };
    } catch {
      return { hour: 0, minute: 0 };
    }
  }
  const parts = s.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1] ?? 0);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

/**
 * Форматирует время из schedule (с бэка — ISO с таймзоной; локально — "HH:mm") в "HH:mm" для отображения.
 */
export function formatScheduleTime(s: string): string {
  const { hour, minute } = parseScheduleTime(s || "00:00");
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
