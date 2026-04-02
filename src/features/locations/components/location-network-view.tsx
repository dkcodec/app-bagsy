"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/src/entities";
import type { ILocationDto } from "@/src/shared/services/location-service";
import { LocationCard } from "./location-card";
import { AddLocationCard } from "./add-location-card";

interface LocationNetworkViewProps {
  locations: ILocationDto[];
  total: number;
  canAddLocation?: boolean;
  onAddLocation: () => void;
}

/**
 * Сетка карточек локаций (network mode, total > 1)
 * Клик по карточке → sub-route /locations/[id]
 */
export function LocationNetworkView({
  locations,
  total,
  canAddLocation = true,
  onAddLocation,
}: LocationNetworkViewProps) {
  const t = useTranslations("Locations");
  const locale = useLocale();
  const router = useRouter();

  const handleSelectLocation = (id: string) => {
    router.push(`/${locale}/locations/${id}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Заголовок: кол-во + кнопка добавления */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("network.locationCount", { count: total })}
        </p>
        {canAddLocation && (
          <Button size="sm" onClick={onAddLocation}>
            <Plus className="h-4 w-4 mr-1" />
            {t("network.addLocation")}
          </Button>
        )}
      </div>

      {/* Сетка: 2 колонки на desktop, 1 на mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {locations.map(loc => (
          <LocationCard
            key={loc.id}
            location={loc}
            onClick={() => handleSelectLocation(loc.id)}
          />
        ))}
        {canAddLocation && <AddLocationCard onClick={onAddLocation} />}
      </div>
    </div>
  );
}
