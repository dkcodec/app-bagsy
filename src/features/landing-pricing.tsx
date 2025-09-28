import { getTranslations } from "next-intl/server";
import { Button } from "@/src/entities/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/entities/card";
import { Badge } from "@/src/entities/badge";
import { Check, Star, Zap, Users, Crown } from "lucide-react";
import Link from "next/link";

export async function LandingPricing() {
  const t = await getTranslations("Landing.pricing");

  return (
    <section className="py-24 bg-gradient-to-br from-background via-accent-50 to-background dark:from-background dark:via-accent-950 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Тарифные планы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Бесплатный план */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-600 transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("free.title")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {t("free.subtitle")}
              </CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t("free.price")}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("free.period")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {[
                  t("free.features.records"),
                  t("free.features.clients"),
                  t("free.features.calendar"),
                  t("free.features.notifications"),
                  t("free.features.support"),
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" size="lg">
                <Link href="/login">{t("free.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Популярный план - Early Access */}
          <Card className="relative border-2 border-accent-500 dark:border-accent-400 shadow-xl scale-105">
            {/* Популярный бейдж */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-1">
                <Star className="h-4 w-4 mr-1" />
                {t("popular.badge")}
              </Badge>
            </div>

            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-accent-500 to-accent-600">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("popular.title")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {t("popular.subtitle")}
              </CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t("popular.price")}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("popular.period")}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                  {t("popular.limited")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {[
                  t("popular.features.unlimited"),
                  t("popular.features.analytics"),
                  //   t("popular.features.integrations"),
                  t("popular.features.priority"),
                  //   t("popular.features.customization"),
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700"
                size="lg"
              >
                <Link href="/login">{t("popular.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Будущий план */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700 opacity-75">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Zap className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("future.title")}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {t("future.subtitle")}
              </CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                  {t("future.price")}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("future.period")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {[
                  t("future.features.enterprise"),
                  t("future.features.api"),
                  t("future.features.whiteLabel"),
                  t("future.features.dedicated"),
                  t("future.features.sla"),
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6"
                size="lg"
                disabled
              >
                <Link href="/login">{t("future.cta")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-accent-100 to-background dark:from-accent-900 dark:to-background rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t("additional.title")}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t("additional.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                <Link href="/contact">{t("additional.contact")}</Link>
              </Button>
              <Button size="lg">
                <Link href="/login">{t("additional.start")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
