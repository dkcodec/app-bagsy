"use client";

import { useDrop } from "react-dnd";
import { differenceInMilliseconds } from "date-fns";

import { useUpdateEvent } from "@/src/shared/hooks";
import { parseTimestamp, toTimestampWithTz } from "@/src/shared/utils/formater";
import { cn } from "@/src/shared/utils/styles";
import { ItemTypes } from "./draggable-event";

import type { IEvent } from "@/src/shared/types/calendar";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({
  date,
  hour,
  minute,
  children,
}: DroppableTimeBlockProps) {
  const { updateEvent } = useUpdateEvent();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.EVENT,
      drop: (item: { event: IEvent }) => {
        const droppedEvent = item.event;

        const eventStartDate = parseTimestamp(droppedEvent.startDate);
        const eventEndDate = parseTimestamp(droppedEvent.endDate);

        const eventDurationMs = differenceInMilliseconds(
          eventEndDate,
          eventStartDate
        );

        const newStartDate = new Date(date);
        newStartDate.setHours(hour, minute, 0, 0);
        const newEndDate = new Date(newStartDate.getTime() + eventDurationMs);

        updateEvent({
          ...droppedEvent,
          startDate: toTimestampWithTz(newStartDate),
          endDate: toTimestampWithTz(newEndDate),
        });

        return { moved: true };
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, hour, minute, updateEvent]
  );

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={cn("h-[24px]", isOver && canDrop && "bg-accent/50")}
    >
      {children}
    </div>
  );
}
