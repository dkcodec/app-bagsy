"use client";

import { useMemo } from "react";
import { useCalendar } from "@/src/features/calendar";
import { useLocationServices } from "@/src/shared/hooks/use-services";
import { EVENT_COLOR_BG, type TEventColor } from "@/src/shared/types/calendar";

/** Легенда цветов услуг под календарем */
export function CalendarColorLegend() {
  const { locationId } = useCalendar();
  const { data } = useLocationServices(locationId);

  // Уникальные пары цвет-название из активных услуг
  const legend = useMemo(() => {
    if (!data?.services) return [];
    const seen = new Set<string>();
    return data.services
      .filter(s => s.active && !seen.has(s.color) && seen.add(s.color))
      .map(s => ({
        name: s.name,
        color: s.color as TEventColor,
      }));
  }, [data?.services]);

  if (legend.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-2">
      {legend.map(item => (
        <span
          key={item.color}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className={`size-2.5 rounded-full ${EVENT_COLOR_BG[item.color] ?? "bg-gray-600"}`}
          />
          {item.name}
        </span>
      ))}
    </div>
  );
}
