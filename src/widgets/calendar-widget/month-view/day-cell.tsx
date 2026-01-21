import { useMemo } from "react";
import { isToday, startOfDay, format } from "date-fns";

import { EventBullet } from "./event-bullet";
import { DroppableDayCell } from "@/src/widgets/calendar-widget/dnd/droppable-day-cell";
import { MonthEventBadge } from "./month-event-badge";

import { cn } from "@/src/shared/utils/styles";
import { getMonthCellEvents } from "@/src/shared/utils/calendar";

import type { ICalendarCell, IEvent } from "@/src/shared/types/calendar";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const t = useTranslations("Dashboard.Calendar.DayCell");
  const { day, currentMonth, date } = cell;
  const router = useRouter();
  const cellEvents = useMemo(
    () => getMonthCellEvents(date, events, eventPositions),
    [date, events, eventPositions]
  );
  const isSunday = date.getDay() === 0;
  const isMonday = date.getDay() === 1;

  const handleCellClick = () => {
    const localDateStr = format(date, "yyyy-MM-dd");
    router.push(`/?date=${localDateStr}&view=day`);
  };

  return (
    <DroppableDayCell cell={cell}>
      <div
        className={cn(
          "flex h-full flex-col gap-1 border-r border-t py-1.5 lg:py-2",
          isMonday && "border-l-0",
          isSunday && "border-r-0"
        )}
        onClick={handleCellClick}
      >
        <span
          className={cn(
            "h-6 px-1 text-xs font-semibold lg:px-2",
            !currentMonth && "opacity-20",
            isToday(date) &&
              "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
          )}
        >
          {day}
        </span>

        <div
          className={cn(
            "flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
            !currentMonth && "opacity-50"
          )}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {[0, 1, 2].map(position => {
            const event = cellEvents.find(e => e.position === position);
            const eventKey = event
              ? `event-${event.id}-${position}`
              : `empty-${position}`;

            return (
              <div key={eventKey} className="lg:flex-1">
                {event && (
                  <>
                    <EventBullet className="lg:hidden" color={event.color} />
                    <MonthEventBadge
                      className="hidden lg:flex cursor-grab"
                      event={event}
                      cellDate={startOfDay(date)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {cellEvents.length > MAX_VISIBLE_EVENTS && (
          <p
            className={cn(
              "h-4.5 px-1.5 text-xs font-semibold text-muted-foreground",
              !currentMonth && "opacity-50"
            )}
          >
            <span className="sm:hidden">
              +{cellEvents.length - MAX_VISIBLE_EVENTS}
            </span>
            <span className="hidden sm:inline">
              {" "}
              {cellEvents.length - MAX_VISIBLE_EVENTS} {t("more")}...
            </span>
          </p>
        )}
      </div>
    </DroppableDayCell>
  );
}
