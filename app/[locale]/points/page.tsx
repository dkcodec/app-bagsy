"use client";

import { PointsHeader, PointsContent } from "@/src/features/points";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/src/entities";
import { Loader } from "lucide-react";

/**
 * Страница точек обслуживания
 * Доступна только для ролей MANAGER и выше
 */
export default function PointsPage() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const t = useTranslations("Points");

  // Проверка загрузки пользователя
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Проверка доступа
  const hasAccess =
    currentUser &&
    (currentUser.role === EUserRole.MANAGER ||
      currentUser.role === EUserRole.SELF_OWNER ||
      currentUser.role === EUserRole.NET_MANAGER ||
      currentUser.role === EUserRole.ADMIN);

  if (!hasAccess) {
    return (
      <>
        <PointsHeader />
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
      <PointsHeader />
      <PointsContent />
    </>
  );
}
