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
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useCalendarStore } from "@/src/features/calendar/calendar-context/store";
import { EUserRole } from "@/src/shared/types/user";
import { Skeleton } from "@/src/entities/skeleton";

/**
 * Глобальный переключатель точки в сайдбаре.
 * Показывается только Owner с >1 локацией.
 * Collapsible dropdown вниз внутри сайдбара.
 */
export function NavLocationSwitcher() {
  const t = useTranslations("Sidebar.LocationSelect");
  const { data: currentUser } = useCurrentUser();
  const { data: locationsData, isLoading } = useLocations();
  const locationId = useCalendarStore(s => s.locationId);
  const setLocationId = useCalendarStore(s => s.setLocationId);
  const setSelectedEmployeeId = useCalendarStore(s => s.setSelectedEmployeeId);
  const [open, setOpen] = useState(false);

  const isOwner = currentUser?.role === EUserRole.OWNER;
  const locations = locationsData?.locations ?? [];

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
      <div className="mx-3 my-2">
        <Skeleton className="h-10 w-full rounded-md" />
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {/* Триггер — кнопка с выбранной точкой */}
      <CollapsibleTrigger asChild>
        <button
          className="mx-3 my-2 flex w-[calc(100%-1.5rem)] items-center justify-between gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors"
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
        <div className="mx-3 mb-2 overflow-hidden rounded-md border border-sidebar-border">
          {locations.map((loc, i) => (
            <button
              key={loc.id}
              onClick={() => handleSelect(loc.id)}
              className={cn(
                "flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs hover:bg-sidebar-accent transition-colors",
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
    </Collapsible>
  );
}
