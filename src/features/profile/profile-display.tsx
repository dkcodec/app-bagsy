"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Skeleton,
} from "@/src/entities";
import { UserDto } from "@/src/shared/services/user-service";

interface ProfileDisplayProps {
  user?: UserDto;
  isLoading?: boolean;
}

/**
 * Компонент отображения информации о пользователе
 * Показывает аватар, основную информацию и статус
 */
export function ProfileDisplay({ user, isLoading }: ProfileDisplayProps) {
  const t = useTranslations("Profile.ProfileDisplay");

  // Генерируем инициалы для аватара
  const initials = user
    ? `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase()
    : "";

  // Определяем статус пользователя
  const getStatusVariant = (isActive: boolean) =>
    isActive ? "default" : "secondary";

  const getStatusText = (isActive: boolean) =>
    isActive ? t("active") : t("inactive");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Аватар и основная информация */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {isLoading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                initials
              )}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                `${user?.name} ${user?.surname}`
              )}
            </h3>
            <div className="text-sm text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-24" /> : user?.phone}
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge variant={getStatusVariant(user?.is_active || false)}>
                {getStatusText(user?.is_active || false)}
              </Badge>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("role")}
            </h4>
            <div className="text-sm">
              {isLoading ? <Skeleton className="h-4 w-20" /> : user?.role}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("pointCode")}
            </h4>
            <div className="text-sm">
              {isLoading ? <Skeleton className="h-4 w-16" /> : user?.point_code}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("createdAt")}
            </h4>
            <div className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                new Date(user?.created_at || "").toLocaleDateString("ru-RU")
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("updatedAt")}
            </h4>
            <div className="text-sm">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                new Date(user?.updated_at || "").toLocaleDateString("ru-RU")
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
