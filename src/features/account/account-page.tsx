"use client";

import { useTranslations } from "next-intl";
import { useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useCurrentUser } from "@/src/shared/hooks";
import { Separator, SidebarTrigger, Skeleton } from "@/src/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/entities/tabs";
import { ProfileTab } from "./tabs/profile-tab";
import { SubscriptionTab } from "./tabs/subscription-tab";
import { SecurityTab } from "./tabs/security-tab";
import { AppearanceTab } from "./tabs/appearance-tab";
import { EUserRole } from "@/src/shared/types/user";

/**
 * Главная страница аккаунта с табами:
 * Profile, Subscription, Security, Appearance
 */
const TABS = ["profile", "subscription", "security", "appearance"] as const;
type Tab = (typeof TABS)[number];

export function AccountPage() {
  const t = useTranslations("Account");
  const { data: user, isLoading } = useCurrentUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isOwner = user?.role === EUserRole.OWNER;

  /* Читаем начальный таб из URL ?tab=..., fallback на profile */
  const initialTab = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab && TABS.includes(initialTab) ? initialTab : "profile"
  );

  /* При смене таба — обновляем стейт + URL через History API */
  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as Tab;
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "profile") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const qs = params.toString();
      window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}`);
    },
    [pathname, searchParams]
  );

  return (
    <>
      {/* Шапка с SidebarTrigger */}
      <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-10 md:relative">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
      </header>

      {/* Контент с табами — full-width контейнер, контент ограничен max-w */}
      <div className="flex flex-1 flex-col p-4 pt-0">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Underline-стиль табов, скролл на мобилке */}
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto mb-6 overflow-x-auto no-scrollbar">
            {TABS.filter(tab => tab !== "subscription" || isOwner).map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="shrink-0 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-sm font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {t(`tabs.${tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Контент табов — ограничен по ширине для удобного чтения */}
          <div className="w-full">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab user={user} isLoading={isLoading} />
            </TabsContent>

            {isOwner && (
              <TabsContent value="subscription" className="mt-0">
                <SubscriptionTab user={user} isLoading={isLoading} />
              </TabsContent>
            )}

            <TabsContent value="security" className="mt-0">
              <SecurityTab user={user} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <AppearanceTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
