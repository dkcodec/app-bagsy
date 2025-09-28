import { Suspense } from "react";
import { DashboardHeader, DashboardContent } from "@/src/features";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("Settings.title");
  return (
    <>
      <DashboardHeader />

      <Suspense fallback={<div className="p-4" />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
