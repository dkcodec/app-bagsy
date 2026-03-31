"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, Check } from "lucide-react";
import { Button, Skeleton, Badge } from "@/src/entities";
import { cn } from "@/src/shared/utils/styles";
import type { IEmployeeDto, ISubscriptionLimit } from "@/src/shared/types/user";

/* Справочник планов для сравнения (цены, фичи) */
const PLANS = [
  {
    id: "solo",
    price: 5000,
    trialMonths: 2,
    popular: false,
    features: [
      "unlimitedBookings",
      "basicCrm",
      "notifications",
      "onlineBooking",
      "reminders",
    ],
  },
  {
    id: "point",
    price: 9000,
    trialMonths: 1,
    popular: true,
    features: [
      "allFromSolo",
      "advancedCrm",
      "analytics:inDevelopment",
      "finance:inDevelopment",
      "inventory:planned",
    ],
  },
  {
    id: "network",
    price: 25000,
    trialMonths: 1,
    popular: false,
    features: [
      "allFromPoint",
      "multiBranch:inDevelopment",
      "consolidatedAnalytics:inDevelopment",
      "apiAccess:planned",
    ],
  },
] as const;

interface SubscriptionTabProps {
  user?: IEmployeeDto;
  isLoading?: boolean;
}

/** Форматирование лимита: "used / max" или "∞" */
function formatLimit(
  limit: ISubscriptionLimit,
  t: ReturnType<typeof useTranslations>
) {
  if (limit.max === null) return t("unlimited");
  return t("usedOfMax", { used: limit.used, max: limit.max });
}

/** Маппинг статуса подписки → i18n ключ + стиль Badge */
const STATUS_MAP: Record<string, { key: string; className: string }> = {
  active: {
    key: "active",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-0",
  },
  trial: {
    key: "trial",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-0",
  },
  expired: {
    key: "expired",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10 border-0",
  },
  cancelled: {
    key: "cancelled",
    className:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/10 border-0",
  },
};

/**
 * Таб «Подписка» — текущий план из API, сравнение, платежи
 */
export function SubscriptionTab({ user, isLoading }: SubscriptionTabProps) {
  const t = useTranslations("Account.Subscription");
  const tf = useTranslations("Account.Subscription.features");
  const tp = useTranslations("Account.Subscription.plans");
  const locale = useLocale();
  const [showPlans, setShowPlans] = useState(false);

  if (isLoading || !user) return <SubscriptionTabSkeleton />;

  const { subscription } = user.organization;
  const currentPlanId = subscription.plan;
  const currentPlan = PLANS.find(p => p.id === currentPlanId);
  const statusInfo = STATUS_MAP[subscription.status] ?? STATUS_MAP.active;

  /* Форматирование даты следующего платежа */
  const dateLocale = locale === "kz" ? "kk-KZ" : "ru-RU";
  const nextPayment = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-4">
      {/* Текущий план */}
      <div className="rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("currentPlan")}
            </p>
            <p className="text-2xl font-medium">
              {tp(`${currentPlanId}.name`)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {tp(`${currentPlanId}.description`)}
            </p>
          </div>
          <Badge variant="default" className={statusInfo.className}>
            {t(statusInfo.key)}
          </Badge>
        </div>

        {/* Лимиты и статистика из API */}
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          <StatCard
            label={t("amount")}
            value={
              currentPlan
                ? `${currentPlan.price.toLocaleString()} ₸ ${t("perMonth")}`
                : "—"
            }
          />
          <StatCard label={t("nextPayment")} value={nextPayment} />
          <StatCard
            label={t("locations")}
            value={formatLimit(subscription.limits.locations, t)}
          />
          <StatCard
            label={t("staffSlots")}
            value={formatLimit(subscription.limits.employees, t)}
          />
          <StatCard
            label={t("bookings")}
            value={formatLimit(subscription.limits.bookings_monthly, t)}
          />
        </div>

        {/* Кнопки */}
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" disabled>
            {t("upgradePlan")}
          </Button>
          <Button variant="outline" onClick={() => setShowPlans(!showPlans)}>
            {t("comparePlans")}
          </Button>
        </div>
      </div>

      {/* Сравнение планов */}
      {showPlans && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-lg border p-4 relative",
                  isCurrent ? "border-primary" : "border-border",
                  plan.popular && "border-primary"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-3 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {t("popular")}
                  </span>
                )}
                <p className="font-medium">{tp(`${plan.id}.name`)}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {tp(`${plan.id}.description`)}
                </p>
                <p className="text-xl font-medium">
                  {plan.price.toLocaleString()} ₸
                  <span className="text-xs text-muted-foreground font-normal">
                    {" "}
                    {t("perMonth")}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {plan.trialMonths > 1
                    ? t("trialMonths", { count: plan.trialMonths })
                    : t("trialMonth")}
                </p>

                {/* Лимиты */}
                <div className="text-xs text-muted-foreground mb-2 space-y-0.5">
                  <p>{tp(`${plan.id}.locations`)}</p>
                  <p>{tp(`${plan.id}.staff`)}</p>
                </div>

                {/* Фичи */}
                <ul className="space-y-1">
                  {plan.features.map(feat => {
                    const [key, badge] = feat.split(":") as [string, string?];
                    return (
                      <li
                        key={feat}
                        className="flex items-start gap-1.5 text-xs"
                      >
                        <Check className="size-3 text-primary shrink-0 mt-0.5" />
                        <span>
                          {tf(key)}
                          {badge && (
                            <span className="text-muted-foreground ml-1">
                              ({tf(badge)})
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning баннер */}
      <div className="rounded-lg bg-amber-500/10 px-4 py-3 flex items-center gap-2.5">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {t("manualPaymentWarning")}{" "}
          <span className="font-medium underline cursor-pointer">
            {t("whatsApp")}
          </span>
        </p>
      </div>

      {/* История платежей */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("paymentHistory")}
        </p>
        <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
          <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.6fr] min-w-[400px] px-4 py-2.5 border-b border-border bg-muted/50">
            <span className="text-xs text-muted-foreground">{t("date")}</span>
            <span className="text-xs text-muted-foreground">
              {t("description")}
            </span>
            <span className="text-xs text-muted-foreground text-right">
              {t("amount")}
            </span>
            <span className="text-xs text-muted-foreground text-right">
              {t("status")}
            </span>
          </div>
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
          </div>
        </div>
      </section>

      {/* Способ оплаты пока нет эквайринга, позже добавлю*/}
      {/*<section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("paymentMethod")}
        </p>
        <div className="rounded-lg border border-border px-4 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("noPaymentMethod")}
          </p>
          <Button variant="outline" size="sm" disabled>
            {t("addCard")}
          </Button>
        </div>
      </section>*/}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-[15px] font-medium">{value}</p>
    </div>
  );
}

function SubscriptionTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-md bg-muted/50 p-3 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}
