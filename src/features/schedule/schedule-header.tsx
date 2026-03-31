import { useTranslations } from "next-intl";
import { Separator, SidebarTrigger } from "@/src/entities";

/** Мок прав и точки — когда будет API, передавать сюда данные пользователя и точки. */
export interface ScheduleHeaderProps {
  userFlags?: {
    can_work?: boolean;
    can_manage_point_schedule?: boolean;
  } | null;
  pointContext?: { schedule_type: "fixed" | "mixed" } | null;
}

/**
 * Заголовок страницы графика: переключатель «Мой график» / «График точки» и бейдж типа графика (fixed/mixed).
 */
export function ScheduleHeader() {
  const t = useTranslations("Schedule.Header");
  return (
    <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-10 md:relative">
      <div className="flex items-center gap-2 px-4 w-full flex-wrap">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
      </div>
    </header>
  );
}
