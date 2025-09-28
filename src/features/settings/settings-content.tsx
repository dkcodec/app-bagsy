"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher, ThemeToggle } from "@/src/widgets";

const SettingsContent: React.FC = () => {
  const t = useTranslations("Settings");

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="rounded-xl bg-[var(--muted-background)] border border-border p-3 md:p-4 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("theme")}</h2>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("language")}</h2>
          </div>
          <LocaleSwitcher />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("notifications")}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SettingsContent };
