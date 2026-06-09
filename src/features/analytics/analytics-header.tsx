"use client";
import { useMemo, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Separator, SidebarTrigger } from "@/src/entities";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { cn } from "@/src/shared/utils/styles";
import { getAnalyticsAccess } from "./utils/access";
import { parsePeriodFromSearch, type IAnalyticsPeriod } from "./utils/period";
import { PeriodPicker } from "./components/period-picker";
import type { TAnalyticsTab } from "./constants";

/**
 * Шапка раздела аналитики:
 *  - title
 *  - роле-зависимые табы (Link, активный по pathname)
 *  - PeriodPicker (синхронизация с URL через ?from&to)
 *
 * Mobile-layout:
 *  - Верхняя строка: hamburger + title (period picker НЕ помещается)
 *  - Под табами: PeriodPicker занимает всю ширину со скроллом по горизонтали
 */
export function AnalyticsHeader() {
  const t = useTranslations("Analytics");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const [, startTransition] = useTransition();

  // Доступные табы — функция от роли+плана
  const access = useMemo(() => getAnalyticsAccess(user), [user]);

  // Текущий период из URL — fallback на пресет "месяц"
  const period: IAnalyticsPeriod = useMemo(
    () => parsePeriodFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  // Запись периода в URL — без скачка скролла, в transition (плавный fade данных).
  // Период сравнения в URL НЕ кладём — бэк сам вычисляет по правилам пресета
  // (см. JSDoc AnalyticsParams в src/shared/types/analytics.ts).
  const updatePeriod = (next: IAnalyticsPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", next.from);
    params.set("to", next.to);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Определяем активный таб по pathname (без локали)
  const cleanPath = pathname.replace(/^\/(ru|kz)/, "");
  const isActive = (tab: TAnalyticsTab) => {
    if (tab === "overview") return cleanPath === "/analytics";
    return cleanPath.startsWith(`/analytics/${tab}`);
  };

  // URL таба + сохраняем текущий период
  const tabHref = (tab: TAnalyticsTab) => {
    const base = tab === "overview" ? "/analytics" : `/analytics/${tab}`;
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  };

  // Если виден только один таб (Solo Owner / Staff) — не рендерим таб-бар
  const showTabs = access.allowedTabs.length > 1;

  return (
    <header className="bg-background sticky top-0 left-0 right-0 z-10 md:relative border-b">
      {/* Верхняя строка: hamburger + title + period picker (только на desktop) */}
      <div className="flex h-14 md:h-16 items-center gap-2 px-3 md:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 md:mr-2 h-4" />
        <h1 className="text-lg md:text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <div className="ml-auto hidden md:block">
          <PeriodPicker period={period} onChange={updatePeriod} />
        </div>
      </div>

      {/* Таб-бар (скрыт если виден только один таб) */}
      {showTabs && (
        <nav
          className="flex items-center gap-1 px-3 md:px-4 overflow-x-auto no-scrollbar"
          aria-label="Analytics sections"
        >
          {access.allowedTabs.map(tab => {
            const active = isActive(tab);
            return (
              <Link
                key={tab}
                href={tabHref(tab)}
                prefetch
                className={cn(
                  "relative px-2.5 md:px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`tabs.${tab}`)}
                {/* Индикатор активного таба */}
                <span
                  className={cn(
                    "absolute left-2.5 right-2.5 md:left-3 md:right-3 -bottom-px h-0.5 rounded-full motion-safe:transition-all",
                    active ? "bg-accent" : "bg-transparent"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      )}

      {/* Период на мобиле — отдельной строкой, горизонтальный скролл если не влезает.
          Правый зазор обеспечивается margin-right на последней кнопке picker'а
          (margin на flex-child НЕ схлопывается при скролле, в отличие от
          padding-right на overflow-контейнере). */}
      <div className="md:hidden px-3 pb-2.5 pt-1 overflow-x-auto no-scrollbar">
        <PeriodPicker period={period} onChange={updatePeriod} />
      </div>
    </header>
  );
}
