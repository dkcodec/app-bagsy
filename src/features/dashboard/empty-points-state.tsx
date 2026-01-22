"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/src/entities";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Компонент для отображения состояния отсутствия точек обслуживания
 * Показывается когда у пользователя нет точек обслуживания
 */
export function EmptyPointsState() {
  const t = useTranslations("Dashboard.emptyPoints");
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md border-none shadow-none bg-background">
        <CardHeader className="text-center space-y-6">
          {/* Большой плюсик сверху */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background border-2 border-dashed border-muted-foreground/20">
              <Plus className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription className="text-base">
              {t("description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center pt-2">
          <Button size="lg" onClick={() => router.push("/points")}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addPointButton")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
