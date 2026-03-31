"use client";

import { useTranslations } from "next-intl";
import { Loader, Monitor, Smartphone } from "lucide-react";
import { Button, Skeleton } from "@/src/entities";
import { usePasswordChangeRequest, useLogout } from "@/src/shared/hooks";
import type { IEmployeeDto } from "@/src/shared/types/user";

interface SecurityTabProps {
  user?: IEmployeeDto;
  isLoading?: boolean;
}

/**
 * Таб «Безопасность» — пароль, сессии, выход
 */
export function SecurityTab({ user, isLoading }: SecurityTabProps) {
  const t = useTranslations("Account.Security");
  const passwordChange = usePasswordChangeRequest();
  const logout = useLogout();

  if (isLoading) {
    return <SecurityTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Пароль */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("password")}
        </p>
        <div className="rounded-lg border border-border px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm">{t("password")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("lastChanged")}: {t("never")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!user?.phone || passwordChange.isPending}
            onClick={() => {
              if (user?.phone) {
                passwordChange.mutate({ phone: user.phone });
              }
            }}
          >
            {passwordChange.isPending ? (
              <Loader className="size-3 animate-spin" />
            ) : (
              t("changePassword")
            )}
          </Button>
        </div>
      </section>

      {/* Активные сессии */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("activeSessions")}
        </p>
        <div className="rounded-lg border border-border divide-y divide-border">
          {/* Текущая сессия */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Monitor className="size-4 text-muted-foreground" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <p className="text-sm">Chrome — Windows</p>
                <p className="text-xs text-muted-foreground">
                  {t("currentSession")}
                </p>
              </div>
            </div>
          </div>

          {/* Пример другой сессии (presentational) */}
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Smartphone className="size-4 text-muted-foreground" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm">Safari — iPhone</p>
                <p className="text-xs text-muted-foreground">
                  {t("daysAgo", { count: 2 })}
                </p>
              </div>
            </div>
            <span className="text-sm text-destructive cursor-pointer">
              {t("revoke")}
            </span>
          </div>
        </div>
      </section>

      {/* Выйти со всех устройств */}
      <div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-border hover:text-destructive hover:bg-destructive/5"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? (
            <Loader className="size-3 animate-spin mr-2" />
          ) : null}
          {t("logoutAll")}
        </Button>
      </div>
    </div>
  );
}

/** Скелетон для SecurityTab */
function SecurityTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Пароль */}
      <div>
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="rounded-lg border border-border px-4 py-4 flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Сессии */}
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <div className="rounded-lg border border-border divide-y divide-border">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="px-4 py-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              {i > 0 && <Skeleton className="h-4 w-14" />}
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка */}
      <Skeleton className="h-8 w-48 rounded-md" />
    </div>
  );
}
