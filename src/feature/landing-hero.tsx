import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/src/entities/button";
import { Calendar, Clock, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export async function LandingHero() {
  const t = await getTranslations("Landing.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent-100 via-white to-accent-100 dark:from-accent-950 dark:via-background dark:to-accent-950">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full light:mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full light:mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full light:mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t("title")}
          </h1>

          {/* Подзаголовок */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-4">
              <Link href="#pricing">{t("cta")}</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link href="#features">{t("learnMore")}</Link>
            </Button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                100+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("activeClients")}
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                500+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("recordsPerMonth")}
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                99.9%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("workTime")}
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("support")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
