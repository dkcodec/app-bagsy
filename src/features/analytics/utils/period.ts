/**
 * Пресеты и парсинг периода для аналитики.
 * Период живёт в URL (?from=YYYY-MM-DD&to=YYYY-MM-DD) — shareable, back/forward.
 *
 * Период сравнения (delta vs prev) — НЕ хранится на фронте. Бэк сам вычисляет
 * предыдущий период по дефолтным правилам (см. JSDoc AnalyticsParams в
 * src/shared/types/analytics.ts).
 */

import type { TPeriodPreset } from "../constants";

export interface IAnalyticsPeriod {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

/**
 * Локально-безопасное форматирование Date → "YYYY-MM-DD".
 * НЕ использует toISOString() — он работает в UTC и в TZ +5 для местной
 * полуночи возвращает предыдущий день.
 */
export function ymdFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

/** Вычисление пресета в конкретные границы (для текущей даты). */
export function getPresetRange(
  preset: TPeriodPreset,
  now: Date = new Date()
): IAnalyticsPeriod {
  const today = startOfDay(now);
  switch (preset) {
    case "today":
      return { from: ymdFromDate(today), to: ymdFromDate(today) };
    case "week":
      // последние 7 дней включая сегодня
      return {
        from: ymdFromDate(addDays(today, -6)),
        to: ymdFromDate(today),
      };
    case "month": {
      // MTD: с 1-го числа текущего месяца по сегодня
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: ymdFromDate(first), to: ymdFromDate(today) };
    }
    case "quarter": {
      // последние 90 дней (упрощение; календарный квартал даёт странные границы)
      return {
        from: ymdFromDate(addDays(today, -89)),
        to: ymdFromDate(today),
      };
    }
    case "custom":
    default:
      // дефолт = месяц
      return getPresetRange("month", now);
  }
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Распарсить период из URLSearchParams; пустые/невалидные → пресет month. */
export function parsePeriodFromSearch(
  params: URLSearchParams,
  fallback: TPeriodPreset = "month"
): IAnalyticsPeriod {
  const from = params.get("from");
  const to = params.get("to");
  if (from && to && YMD.test(from) && YMD.test(to)) {
    return { from, to };
  }
  return getPresetRange(fallback);
}

/** Определить, какому пресету соответствует текущий период (или "custom"). */
export function inferPreset(
  period: IAnalyticsPeriod,
  now: Date = new Date()
): TPeriodPreset {
  for (const preset of ["today", "week", "month", "quarter"] as const) {
    const r = getPresetRange(preset, now);
    if (r.from === period.from && r.to === period.to) return preset;
  }
  return "custom";
}

/** Кол-во дней в периоде включительно. */
export function periodDays(period: IAnalyticsPeriod): number {
  const from = new Date(period.from + "T00:00:00");
  const to = new Date(period.to + "T00:00:00");
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}
