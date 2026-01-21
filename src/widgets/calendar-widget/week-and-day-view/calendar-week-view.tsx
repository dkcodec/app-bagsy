import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  isSameDay,
  areIntervalsOverlapping,
} from "date-fns";
import { ru, kk } from "date-fns/locale";

import { useCalendar } from "@/src/features/calendar";

import { ScrollArea } from "@/src/entities/scroll-area";

import { AddEventDialog } from "@/src/features/calendar/event-dialogs";
import { EventBlock } from "./event-block";
import { DroppableTimeBlock } from "@/src/widgets/calendar-widget/dnd";
import { CalendarTimeline } from "./calendar-time-line";
import { WeekViewMultiDayEventsRow } from "./week-view-multi-day-events-row";

import { cn } from "@/src/shared/utils/styles";
import {
  groupEvents,
  getEventBlockStyle,
  isWorkingHour,
  getVisibleHours,
} from "@/src/shared/utils/calendar";

import type { IEvent } from "@/src/shared/types/calendar";
import { useLocale } from "next-intl";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate, workingHours, visibleHours } = useCalendar();
  const locale = useLocale();
  const isMobile = useIsMobile();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(
    visibleHours,
    singleDayEvents
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col">
      <div>
        <WeekViewMultiDayEventsRow
          selectedDate={selectedDate}
          multiDayEvents={multiDayEvents}
        />

        {/* Week header */}
        <div className="relative flex border-b">
          <div className="w-12 sm:w-18"></div>
          <div className="grid flex-1 grid-cols-7 divide-x border-l">
            {weekDays.map((day, index) => (
              <span
                key={day.getTime()}
                className="py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {format(day, isMobile ? "EEEEE" : "EEE", {
                  locale: locale == "ru" ? ru : kk,
                }).capitalize()}
                <span className="ml-1 font-semibold text-foreground">
                  {format(day, "d")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea type="always">
        <div className="flex overflow-hidden">
          {/* Hours column */}
          <div className="relative w-12 sm:w-18">
            {hours.map((hour, index) => (
              <div key={hour} className="relative" style={{ height: "96px" }}>
                <div className="absolute -top-3 right-2 flex h-6 items-center">
                  {index !== 0 && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Week grid */}
          <div className="relative flex-1 border-l">
            <div className="grid grid-cols-7 divide-x">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = singleDayEvents.filter(
                  event =>
                    isSameDay(parseISO(event.startDate), day) ||
                    isSameDay(parseISO(event.endDate), day)
                );
                const groupedEvents = groupEvents(dayEvents);

                return (
                  <div key={dayIndex} className="relative">
                    {hours.map((hour, index) => {
                      const isDisabled = !isWorkingHour(
                        day,
                        hour,
                        workingHours
                      );

                      return (
                        <div
                          key={hour}
                          className={cn(
                            "relative",
                            isDisabled && "bg-calendar-disabled-hour"
                          )}
                          style={{ height: "96px" }}
                        >
                          {index !== 0 && (
                            <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                          )}

                          <DroppableTimeBlock date={day} hour={hour} minute={0}>
                            <AddEventDialog
                              startDate={day}
                              startTime={{ hour, minute: 0 }}
                            >
                              <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                            </AddEventDialog>
                          </DroppableTimeBlock>

                          <DroppableTimeBlock
                            date={day}
                            hour={hour}
                            minute={15}
                          >
                            <AddEventDialog
                              startDate={day}
                              startTime={{ hour, minute: 15 }}
                            >
                              <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                            </AddEventDialog>
                          </DroppableTimeBlock>

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                          <DroppableTimeBlock
                            date={day}
                            hour={hour}
                            minute={30}
                          >
                            <AddEventDialog
                              startDate={day}
                              startTime={{ hour, minute: 30 }}
                            >
                              <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                            </AddEventDialog>
                          </DroppableTimeBlock>

                          <DroppableTimeBlock
                            date={day}
                            hour={hour}
                            minute={45}
                          >
                            <AddEventDialog
                              startDate={day}
                              startTime={{ hour, minute: 45 }}
                            >
                              <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                            </AddEventDialog>
                          </DroppableTimeBlock>
                        </div>
                      );
                    })}

                    {groupedEvents.map((group, groupIndex) =>
                      group.map((event, eventIndex) => {
                        let style = getEventBlockStyle(
                          event,
                          day,
                          groupIndex,
                          groupedEvents.length,
                          { from: earliestEventHour, to: latestEventHour }
                        );
                        const hasOverlap = groupedEvents.some(
                          (otherGroup, otherIndex) =>
                            otherIndex !== groupIndex &&
                            otherGroup.some(otherEvent =>
                              areIntervalsOverlapping(
                                {
                                  start: parseISO(event.startDate),
                                  end: parseISO(event.endDate),
                                },
                                {
                                  start: parseISO(otherEvent.startDate),
                                  end: parseISO(otherEvent.endDate),
                                }
                              )
                            )
                        );

                        if (!hasOverlap)
                          style = { ...style, width: "100%", left: "0%" };

                        return (
                          <div
                            key={`${dayIndex}-${groupIndex}-${event.id}-${eventIndex}`}
                            className="absolute p-1"
                            style={style}
                          >
                            <EventBlock event={event} />
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>

            <CalendarTimeline
              firstVisibleHour={earliestEventHour}
              lastVisibleHour={latestEventHour}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
