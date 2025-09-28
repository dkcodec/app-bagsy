"use client";

import { Button } from "@/src/entities/button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  const t = useTranslations("InviteForm.NotFound");

  return (
    <div className="relative overflow-hidden flex min-h-svh bg-gradient-to-br from-accent-100 via-white to-accent-100 dark:from-accent-950 dark:via-background dark:to-accent-950 flex-col items-center justify-center p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-5 -z-0" />
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mb-4">{t("description")}</p>

        <Button asChild>
          <Link href="/">{t("button")}</Link>
        </Button>
      </div>
    </div>
  );
}
