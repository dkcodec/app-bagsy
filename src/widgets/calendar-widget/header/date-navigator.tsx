import { useMemo } from "react";
import { formatDate } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCalendar } from "@/src/features/calendar";

import { Badge } from "@/src/entities/badge";
import { Button } from "@/src/entities/button";

import {
  getEventsCount,
  navigateDate,
  rangeText,
} from "@/src/shared/utils/calendar";

import type { IEvent, TCalendarView } from "@/src/shared/types/calendar";
import { useLocale, useTranslations } from "next-intl";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
}

export function DateNavigator({ view, events }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const locale = useLocale();
  const t = useTranslations("Dashboard.Calendar.Header");

  const month = formatDate(selectedDate, "MMMM", {
    locale: locale == "ru" ? ru : kk,
  }).capitalize();
  const year = selectedDate.getFullYear();

  const eventCount = useMemo(
    () => getEventsCount(events, selectedDate, view),
    [events, selectedDate, view]
  );

  const handlePrevious = () =>
    setSelectedDate(navigateDate(selectedDate, view, "previous"));
  const handleNext = () =>
    setSelectedDate(navigateDate(selectedDate, view, "next"));

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month} {year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {eventCount} {t("events")}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </Button>

        <p className="text-sm text-muted-foreground">
          {rangeText(view, selectedDate, locale)}
        </p>

        <Button
          variant="outline"
          className="size-6.5 px-0 [&_svg]:size-4.5"
          onClick={handleNext}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
