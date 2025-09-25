"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const DashboardTitle = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const t = useTranslations("Dashboard.title");

  useEffect(() => {
    const timeoutId = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timeoutId);
  }, []);
  return (
    <div className="relative h-6 w-full">
      <h1
        className={`text-xl font-bold transition-opacity duration-700 ease-out ${
          showWelcome ? "opacity-100" : "opacity-0"
        }`}
      >
        {t("welcome")}
      </h1>
      <h1
        className={`text-xl font-bold transition-opacity duration-700 ease-out absolute inset-0 ${
          showWelcome ? "opacity-0" : "opacity-100"
        }`}
      >
        {t("panel", { name: "Менеджер" })}
      </h1>
    </div>
  );
};

export { DashboardTitle };
