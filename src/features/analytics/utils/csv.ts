/**
 * Минимальный CSV-экспорт для аналитики.
 * UTF-8 + BOM (﻿) — чтобы Excel правильно открывал кириллицу.
 * Никаких сторонних зависимостей.
 */

/** Экранирование значения по RFC 4180. */
function escapeCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  // Если есть запятая, кавычка или перевод строки — оборачиваем и удваиваем кавычки
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Скачать CSV-файл на устройство. */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
): void {
  const head = headers.map(escapeCell).join(";");
  const body = rows.map(r => r.map(escapeCell).join(";")).join("\n");
  const blob = new Blob(["﻿", head, "\n", body], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
