/**
 * Компонент для отображения статуса авторизации
 * Демонстрирует использование хуков авторизации
 */

"use client";

import { useAuth } from "@/src/shared/hooks";
import { Button } from "@/src/entities/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities/card";
import { Skeleton } from "@/src/entities/skeleton";

export function AuthStatus() {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статус авторизации</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Статус авторизации</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Пользователь не авторизован</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус авторизации</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Имя:</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email:</p>
          <p className="font-medium">{user?.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Роль:</p>
          <p className="font-medium">{user?.role}</p>
        </div>
        <Button
          onClick={() => logout()}
          disabled={isLoggingOut}
          variant="destructive"
          className="w-full"
        >
          {isLoggingOut ? "Выход..." : "Выйти"}
        </Button>
      </CardContent>
    </Card>
  );
}
