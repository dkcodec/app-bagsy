"use client";
import { useEffect, useState } from "react";
import { cn } from "@/src/shared/utils/styles";
import { formatPercent } from "@/src/shared/utils";

interface TopListItem {
  id: string;
  name: string;
  /** Главное значение в строке (например выручка) */
  value: number;
  /** Доля 0..1 — ширина прогресс-бара */
  share: number;
}

interface TopListProps {
  items: TopListItem[];
  /** Форматтер главного значения (например formatTenge) */
  format: (n: number) => string;
  /** Клик по строке → drill-down */
  onSelect?: (id: string) => void;
}

/**
 * Универсальный Top-N список с анимированными прогресс-барами.
 * Бары растут от 0 к финальной ширине при появлении (через transition).
 */
export function TopList({ items, format, onSelect }: TopListProps) {
  // Локальный флаг "запустить анимацию" — на следующем тике после mount
  // ширина переходит от 0 к финальной, что даёт плавное появление.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={cn(
            "group",
            onSelect &&
              "cursor-pointer hover:bg-muted/40 rounded-md p-1 -m-1 transition-colors"
          )}
          onClick={() => onSelect?.(item.id)}
        >
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-sm font-medium truncate">
              <span className="text-muted-foreground mr-1.5 tabular-nums">
                {i + 1}.
              </span>
              {item.name}
            </span>
            <span className="text-sm tabular-nums font-semibold whitespace-nowrap">
              {format(item.value)}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                ({formatPercent(item.share * 100)})
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-300 to-accent-500 motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
              style={{ width: ready ? `${item.share * 100}%` : "0%" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
