import { useTranslations } from "next-intl";
import {
  Separator,
  SidebarTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities";
import type { ILocationDto } from "@/src/shared/services/location-service";

export interface ScheduleHeaderProps {
  /** Список локаций для Select (только network plan). */
  locations?: ILocationDto[];
  selectedLocationId?: string;
  onLocationChange?: (id: string) => void;
  /** Показывать Select локации. */
  showLocationSelect?: boolean;
}

/**
 * Заголовок страницы графика.
 * Для network плана — Select локации справа.
 */
export function ScheduleHeader({
  locations = [],
  selectedLocationId,
  onLocationChange,
  showLocationSelect = false,
}: ScheduleHeaderProps) {
  const t = useTranslations("Schedule.Header");
  return (
    <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-10 md:relative">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>

        {/* Select локации — только для network плана с >1 точкой */}
        {showLocationSelect && onLocationChange && (
          <div className="ml-auto w-48 md:w-56">
            <Select
              value={selectedLocationId}
              onValueChange={onLocationChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t("selectLocation")} />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </header>
  );
}
