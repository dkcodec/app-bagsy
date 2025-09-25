import React from "react";

import { InviteForm } from "@/src/all-pages/exports";
import { getIsMobile } from "@/src/shared/hooks/use-mobile-server";
import LoginBackground from "@/src/widgets/login-background";
import { notFound } from "next/navigation";
import { decodeJwt, secondsToDate } from "@/src/shared/utils/jwt";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const isMobile = await getIsMobile();
  const params = await searchParams;
  const token = params?.token || "";

  try {
    if (!token) notFound();
    const { exp } = decodeJwt<{ exp?: number }>(token);
    const expDate = secondsToDate(exp);
    if (!expDate || expDate < new Date()) notFound();
  } catch {
    notFound();
  }

  return (
    <div className="flex min-h-svh bg-gradient-to-br from-accent-100 via-white to-accent-100 dark:from-accent-950 dark:via-background dark:to-accent-950 flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <LoginBackground isMobile={isMobile} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full max-w-sm">
          <InviteForm token={token} />
        </div>
      </div>
    </div>
  );
}
