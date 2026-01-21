import { useMemo, memo } from "react";
import { useCalendar } from "@/src/features/calendar";
import { DayCell } from "./day-cell";

import {
  getCalendarCells,
  calculateMonthEventPositions,
} from "@/src/shared/utils/calendar";

import type { IEvent } from "@/src/shared/types/calendar";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const WEEK_DAYS = [
  { mobile: "mon", desktop: "monday" },
  { mobile: "tue", desktop: "tuesday" },
  { mobile: "wed", desktop: "wednesday" },
  { mobile: "thu", desktop: "thursday" },
  { mobile: "fri", desktop: "friday" },
  { mobile: "sat", desktop: "saturday" },
  { mobile: "sun", desktop: "sunday" },
];

export const CalendarMonthView = memo(function CalendarMonthView({
  singleDayEvents,
  multiDayEvents,
}: IProps) {
  const { selectedDate } = useCalendar();
  const t = useTranslations("Dashboard.Settings");
  const isMobile = useIsMobile();

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () =>
      calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate
      ),
    [multiDayEvents, singleDayEvents, selectedDate]
  );

  return (
    <div>
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map(day => (
          <div
            key={day.mobile}
            className="flex items-center justify-center py-2 border-r last:border-r-0"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {isMobile ? t(day.mobile) : t(day.desktop)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => (
          <DayCell
            key={cell.date.getTime()}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </div>
  );
});
