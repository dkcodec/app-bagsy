import React from "react";
import { SidebarTrigger } from "@/src/entities/sidebar";
import { Separator } from "@/src/entities/separator";
import { DashboardTitle } from "@/src/entities/dashboard-title";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/entities/select";
import type { ILocationDto } from "@/src/shared/services/location-service";

interface DashboardHeaderProps {
  /** Список локаций для Owner (пустой для других ролей) */
  locations?: ILocationDto[];
  selectedLocationId?: string;
  onLocationChange?: (locationId: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  locations = [],
  selectedLocationId,
  onLocationChange,
}) => {
  // Показываем Select только если есть несколько точек
  const showLocationSelect = locations.length > 1;

  return (
    <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-20">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DashboardTitle />

        {/* Выбор точки для Owner с несколькими локациями */}
        {showLocationSelect && (
          <Select
            value={selectedLocationId}
            onValueChange={id => onLocationChange?.(id)}
          >
            <SelectTrigger className="w-auto max-w-[200px] ml-auto">
              <MapPin className="size-4 shrink-0 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
