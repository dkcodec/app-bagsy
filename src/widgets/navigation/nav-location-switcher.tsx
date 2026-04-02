"use client";

import { ChevronsUpDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/src/shared/utils/styles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/entities/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/entities/tooltip";
import { SidebarSeparator, useSidebar } from "@/src/entities/sidebar";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useCalendarStore } from "@/src/features/calendar/calendar-context/store";
import { EUserRole } from "@/src/shared/types/user";
import { Skeleton } from "@/src/entities/skeleton";

/** Получить инициалы из названия (первые 2 буквы первых 2 слов) */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Глобальный переключатель точки в сайдбаре.
 * Показывается только Owner с >1 локацией.
 * Expanded: Collapsible dropdown. Collapsed: кружок с инициалами + popover.
 */
export function NavLocationSwitcher() {
  const t = useTranslations("Sidebar.LocationSelect");
  const { state: sidebarState } = useSidebar();
  const { data: currentUser } = useCurrentUser();
  const { data: locationsData, isLoading } = useLocations();
  const locationId = useCalendarStore(s => s.locationId);
  const setLocationId = useCalendarStore(s => s.setLocationId);
  const setSelectedEmployeeId = useCalendarStore(s => s.setSelectedEmployeeId);
  const [open, setOpen] = useState(false);

  const isOwner = currentUser?.role === EUserRole.OWNER;
  const locations = locationsData?.locations ?? [];

  // Закрываем dropdown при смене режима сайдбара
  useEffect(() => {
    setOpen(false);
  }, [sidebarState]);

  // Инициализация: если locationId не задан — ставим первую локацию
  useEffect(() => {
    if (isOwner && locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [isOwner, locations, locationId, setLocationId]);

  // Не Owner или одна точка — не показываем
  if (!isOwner || (!isLoading && locations.length <= 1)) return null;

  if (isLoading) {
    return (
      <div className="mx-2 my-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:my-1">
        <Skeleton className="h-10 w-full rounded-md group-data-[collapsible=icon]:size-8" />
      </div>
    );
  }

  const selected = locations.find(l => l.id === locationId) ?? locations[0];

  const formatAddress = (address: { street: string; building: string }) => {
    if (!address.street) return "";
    return `${address.street}, ${address.building}`;
  };

  const handleSelect = (id: string) => {
    if (id !== locationId) {
      setLocationId(id);
      setSelectedEmployeeId("all");
    }
    setOpen(false);
  };

  // === Оба варианта рендерятся всегда, переключаются через CSS ===
  // grid-rows-[0fr]/[1fr] + opacity анимируют высоту и прозрачность плавно
  return (
    <>
      {/* === Collapsed: иконки с инициалами === */}
      <div className="grid grid-rows-[0fr] opacity-0 pointer-events-none group-data-[collapsible=icon]:grid-rows-[1fr] group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:pointer-events-auto transition-[grid-template-rows,opacity] duration-200 ease-out">
        <div className="overflow-hidden">
          <Collapsible open={open} onOpenChange={setOpen}>
            <div className="flex flex-col items-center gap-1 px-2">
              {/* Триггер — выбранная локация */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "size-8 rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors",
                        "ring-1.5 ring-sidebar-foreground/20 hover:bg-sidebar-accent bg-sidebar-accent",
                        open && "ring-sidebar-foreground/40"
                      )}
                      aria-label={selected.name}
                    >
                      <span className="text-[11px] font-semibold leading-none">
                        {getInitials(selected.name)}
                      </span>
                      <div
                        className={cn(
                          "size-1 rounded-full mt-0.5",
                          selected.active ? "bg-green-500" : "bg-yellow-500"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" hidden={open}>
                  {selected.name}
                </TooltipContent>
              </Tooltip>

              {/* Остальные локации выезжают вниз */}
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="flex flex-col items-center gap-1 pt-1">
                  {locations
                    .filter(loc => loc.id !== locationId)
                    .map(loc => (
                      <Tooltip key={loc.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSelect(loc.id)}
                            className="size-8 rounded-md flex items-center justify-center cursor-pointer transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent"
                            aria-label={loc.name}
                          >
                            <span className="text-[11px] font-medium leading-none">
                              {getInitials(loc.name)}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{loc.name}</TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </CollapsibleContent>

              <SidebarSeparator className="mt-1 w-full rounded-full" />
            </div>
          </Collapsible>
        </div>
      </div>

      {/* === Expanded: dropdown с названиями === */}
      <div className="grid grid-rows-[1fr] opacity-100 pointer-events-auto group-data-[collapsible=icon]:grid-rows-[0fr] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none transition-[grid-template-rows,opacity] duration-200 ease-out">
        <div className="overflow-hidden">
          <Collapsible open={open} onOpenChange={setOpen}>
            {/* Триггер — кнопка с выбранной точкой */}
            <CollapsibleTrigger asChild>
              <button
                className="mx-2 my-2 flex w-[calc(100%-1rem)] items-center justify-between gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors"
                aria-label={t("label")}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      selected.active ? "bg-green-500" : "bg-yellow-500"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-xs leading-tight">
                      {selected.name}
                    </div>
                    {selected.address?.street && (
                      <div className="truncate text-[10px] text-muted-foreground leading-tight">
                        {formatAddress(selected.address)}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </CollapsibleTrigger>

            {/* Выпадающий список точек */}
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <div className="mx-2 mb-2 overflow-hidden rounded-md border border-sidebar-border">
                {locations.map((loc, i) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelect(loc.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-2 py-2 text-left text-xs hover:bg-sidebar-accent transition-colors",
                      i > 0 && "border-t border-sidebar-border",
                      loc.id === locationId && "bg-sidebar-accent"
                    )}
                  >
                    {/* Индикатор активности */}
                    <div
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        loc.active ? "bg-green-500" : "bg-yellow-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "truncate text-xs",
                          loc.id === locationId && "font-medium"
                        )}
                      >
                        {loc.name}
                      </div>
                      {loc.address?.street && (
                        <div className="truncate text-[10px] text-muted-foreground">
                          {formatAddress(loc.address)}
                        </div>
                      )}
                    </div>
                    {loc.id === locationId && (
                      <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </CollapsibleContent>

            <SidebarSeparator className="mt-1 w-[calc(100%-1rem)] rounded-full" />
          </Collapsible>
        </div>
      </div>
    </>
  );
}
