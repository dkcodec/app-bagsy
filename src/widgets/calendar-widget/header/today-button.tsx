import { formatDate } from "date-fns";

import { useCalendar } from "@/src/features/calendar";
import { kk, ru } from "date-fns/locale";
import { useLocale } from "next-intl";

export function TodayButton() {
  const { setSelectedDate } = useCalendar();
  const locale = useLocale();

  const today = new Date();
  const handleClick = () => setSelectedDate(today);

  return (
    <button
      className="flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      onClick={handleClick}
    >
      <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">
        {formatDate(today, "MMM", {
          locale: locale == "ru" ? ru : kk,
        })
          .toUpperCase()
          .slice(0, -1)}
      </p>
      <p className="flex w-full items-center justify-center text-lg font-bold">
        {today.getDate()}
      </p>
    </button>
  );
}
