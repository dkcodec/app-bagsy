import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/entities/card";
import { Badge } from "@/src/entities/badge";
import {
  Calendar,
  Smartphone,
  Users,
  BarChart3,
  Bell,
  Zap,
  CheckCircle,
} from "lucide-react";

export async function LandingFeatures() {
  const t = await getTranslations("Landing.features");

  const featureIcons = {
    easyBooking: Calendar,
    smartCalendar: Zap,
    clientManagement: Users,
    analytics: BarChart3,
    notifications: Bell,
    mobileApp: Smartphone,
  };

  const featureKeys = Object.keys(featureIcons) as Array<
    keyof typeof featureIcons
  >;

  const comingSoonFeatures: Array<keyof typeof featureIcons> = [
    "smartCalendar",
    "mobileApp",
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <Badge variant="default" className="mb-4">
            {t("opportunity")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Сетка функций */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureKeys.map(featureKey => {
            const Icon = featureIcons[featureKey];
            const title = t(`items.${featureKey}.title`);
            const description = t(`items.${featureKey}.description`);

            return (
              <Card
                key={featureKey}
                className="group card-hover border-0 shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-accent-100 dark:bg-accent-900 group-hover:bg-accent-200 dark:group-hover:bg-accent-800 transition-colors">
                      <Icon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                          {title}
                        </CardTitle>
                        {comingSoonFeatures.includes(featureKey) && (
                          <Badge variant="secondary" className="text-xs">
                            {t("comingSoon")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {description}
                  </CardDescription>
                  {/* <div className="mt-4 flex items-center text-accent-500 dark:text-accent-200 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>{t("learnMore")}</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div> */}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Дополнительные преимущества */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-accent-100 to-background dark:from-accent-700 dark:to-background rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("Additional.alInOne")}
                </h3>
                <p className="text-lg text-gray-600 dark:text-accent-100 mb-6">
                  {t("Additional.description")}
                </p>
                <div className="space-y-3">
                  {[
                    t("Additional.reminders"),
                    t("Additional.multilingualSupport"),
                    t("Additional.safeStorage"),
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-accent-100">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:text-right">
                <div className="inline-block p-8 bg-background dark:bg-0 rounded-2xl shadow-lg">
                  <div className="text-4xl font-bold text-accent-600 dark:text-accent-400 mb-2">
                    100%
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {t("Additional.customerSatisfaction")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
