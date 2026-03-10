"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
} from "@/src/entities";
import { useLocations } from "@/src/shared/hooks/use-network-locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/src/entities";

/**
 * Компонент выбора локации (локации обслуживания)
 * Для MANAGER использует currentUser.location_id
 * Для OWNER показывает Select с локациями организации
 */
interface LocationSelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

export function LocationSelect({ value, onValueChange }: LocationSelectProps) {
  const t = useTranslations("Services.locationSelect");
  const { data: currentUser } = useCurrentUser();

  // Для MANAGER используем location_id из currentUser
  const isManager = currentUser?.role === EUserRole.MANAGER;
  const managerLocationId = currentUser?.location_id;

  // Для Owner загружаем локации организации
  const shouldLoadLocations =
    currentUser && currentUser.role === EUserRole.OWNER;

  const { data: locationsData, isLoading: isLoadingLocations } = useLocations();

  // Для MANAGER не показываем селектор
  if (isManager && managerLocationId) {
    return null;
  }

  // Если локации загружаются
  if (shouldLoadLocations && isLoadingLocations) {
    return (
      <div className="flex-1 min-w-[200px]">
        <Label className="mb-2 block">{t("label")}</Label>
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  // Если есть локации - показываем Select
  if (
    shouldLoadLocations &&
    locationsData &&
    locationsData.locations.length > 0
  ) {
    return (
      <div className="flex-1 min-w-[200px]">
        <Label className="mb-2 block">{t("label")}</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {locationsData.locations.map(location => (
              <SelectItem key={location.id} value={location.id}>
                {location.name} ({location.id.slice(0, 4)}...)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback: Input для ручного ввода (если локаций нет)
  return (
    <div className="flex-1 min-w-[200px]">
      <Label className="mb-2 block">{t("label")}</Label>
      <Input
        placeholder={t("placeholder")}
        value={value || ""}
        onChange={e => onValueChange(e.target.value)}
      />
    </div>
  );
}
