"use client";

import { LocationsHeader, LocationsContent } from "@/src/features/locations";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/src/entities";
import { Loader } from "lucide-react";

/**
 * Страница точек обслуживания
 * Доступна только для ролей MANAGER и выше
 */
export default function LocationsPage() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const t = useTranslations("Locations");

  // Проверка загрузки пользователя
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Проверка доступа
  // Доступ: Owner и Manager
  const hasAccess =
    currentUser &&
    (currentUser.role === EUserRole.OWNER ||
      currentUser.role === EUserRole.MANAGER);

  if (!hasAccess) {
    return (
      <>
        <LocationsHeader />
        <div className="flex flex-col md:p-4">
          <Card className="border-none">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="font-semibold mb-2 text-destructive">
                  {t("accessDenied")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("accessDeniedDescription")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <LocationsHeader />
      <LocationsContent />
    </>
  );
}
