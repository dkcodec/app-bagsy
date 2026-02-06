"use client";

import { Button } from "@/src/entities";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const t = useTranslations("Offline");
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-gray-200 max-w-md">{t("description")}</p>
        <Button onClick={() => router.push("/")}>{t("retry")}</Button>
      </div>
    </div>
  );
}
