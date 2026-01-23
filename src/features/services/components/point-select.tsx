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
import { useNetworkPoints } from "@/src/shared/hooks/use-network-points";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/src/entities";

/**
 * Компонент выбора точки обслуживания
 * Для MANAGER использует currentUser.point_code
 * Для SELF_OWNER/NET_MANAGER показывает Select с точками сети
 * Для ADMIN показывает Select или Input для ручного ввода
 */
interface PointSelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  networkCode?: string;
}

export function PointSelect({
  value,
  onValueChange,
  networkCode,
}: PointSelectProps) {
  const t = useTranslations("Services.pointSelect");
  const { data: currentUser } = useCurrentUser();

  // Для MANAGER используем point_code из currentUser
  const isManager = currentUser?.role === EUserRole.MANAGER;
  const managerPointCode = currentUser?.point_code;

  // Для SELF_OWNER/NET_MANAGER загружаем точки сети
  const shouldLoadPoints =
    currentUser &&
    (currentUser.role === EUserRole.SELF_OWNER ||
      currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.ADMIN);

  const { data: networkPointsData, isLoading: isLoadingPoints } =
    useNetworkPoints(networkCode || currentUser?.network_code);

  // Для MANAGER не показываем селектор
  if (isManager && managerPointCode) {
    return null;
  }

  // Если точки загружаются
  if (shouldLoadPoints && isLoadingPoints) {
    return (
      <div className="flex-1 min-w-[200px]">
        <Label className="mb-2 block">{t("label")}</Label>
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  // Если есть точки сети - показываем Select
  if (
    shouldLoadPoints &&
    networkPointsData &&
    networkPointsData.points.length > 0
  ) {
    return (
      <div className="flex-1 min-w-[200px]">
        <Label className="mb-2 block">{t("label")}</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {networkPointsData.points.map(point => (
              <SelectItem key={point.code} value={point.code}>
                {point.name} ({point.code.slice(0, 4)}...)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback: Input для ручного ввода (для ADMIN или если точек нет)
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
