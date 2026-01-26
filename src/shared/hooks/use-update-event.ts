"use client";

import { useCalendar } from "@/src/features/calendar";
import { parseTimestamp, toTimestampWithTz } from "@/src/shared/utils/formater";
import type { IEvent } from "@/src/shared/types/calendar";

export function useUpdateEvent() {
  const { setLocalEvents } = useCalendar();

  // This is just and example, in a real scenario
  // you would call an API to update the event
  const updateEvent = (event: IEvent) => {
    // Создаем новый объект вместо мутации существующего
    const newEvent: IEvent = {
      ...event,
      startDate: toTimestampWithTz(parseTimestamp(event.startDate)),
      endDate: toTimestampWithTz(parseTimestamp(event.endDate)),
    };

    setLocalEvents(prev => {
      const index = prev.findIndex(e => e.id === event.id);
      if (index === -1) return prev;
      return [...prev.slice(0, index), newEvent, ...prev.slice(index + 1)];
    });
  };

  return { updateEvent };
}
