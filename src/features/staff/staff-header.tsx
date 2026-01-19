import { useTranslations } from "next-intl";
import { Separator, SidebarTrigger } from "@/src/entities";

/**
 * Заголовок страницы сотрудников
 * Отображает приветствие и основную информацию
 */
export function StaffHeader() {
  const t = useTranslations("Staff");

  return (
    <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-10 md:relative">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>
    </header>
  );
}
