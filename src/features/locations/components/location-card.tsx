"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, Badge, Skeleton } from "@/src/entities";
import type { ILocationDto } from "@/src/shared/services/location-service";
import { useGetEmployees } from "@/src/shared/hooks/user-staff";
import { useLocationServices } from "@/src/shared/hooks/use-services";

interface LocationCardProps {
  location: ILocationDto;
  onClick: () => void;
}

/**
 * Карточка локации для network grid
 * Показывает: имя, статус, адрес, кол-во сотрудников и услуг
 */
export function LocationCard({ location, onClick }: LocationCardProps) {
  const t = useTranslations("Locations");
  const { data: employeesData, isLoading: empLoading } = useGetEmployees({
    location_id: location.id,
  });
  const { data: servicesData, isLoading: svcLoading } = useLocationServices(
    location.id
  );

  const address = useMemo(() => {
    const { street, building, city } = location.address;
    return [street, building, city].filter(Boolean).join(", ");
  }, [location.address]);

  const statsLoading = empLoading || svcLoading;

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors p-4"
      onClick={onClick}
    >
      {/* Имя + статус */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[15px] font-medium truncate">{location.name}</p>
        <Badge
          variant={location.active ? "default" : "outline"}
          className="shrink-0 text-[11px]"
        >
          {location.active ? t("active") : t("inactive")}
        </Badge>
      </div>

      {/* Адрес */}
      <p className="text-[13px] text-muted-foreground mb-3 truncate">
        {address}
      </p>

      {/* Статистика */}
      {statsLoading ? (
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      ) : (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            {employeesData?.total ?? 0} {t("network.staff")}
          </span>
          <span>
            {servicesData?.services?.length ?? 0} {t("network.services")}
          </span>
        </div>
      )}
    </Card>
  );
}
