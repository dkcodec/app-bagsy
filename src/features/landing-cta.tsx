import { getTranslations } from "next-intl/server";
import { Card } from "@/src/entities/card";
import { Star, Users, TrendingUp } from "lucide-react";

export async function LandingCTA() {
  const t = await getTranslations("Landing.cta");

  // Отзывы клиентов
  const testimonials = [
    {
      name: "Анна Петрова",
      role: "Владелец салона красоты",
      content:
        "Bagsy кардинально изменил работу нашего салона. Теперь все записи организованы, клиенты довольны, а мы экономим время.",
      rating: 5,
    },
    {
      name: "Марат Касымов",
      role: "Менеджер клиники",
      content:
        "Отличный сервис! Простой интерфейс, надежная работа. Рекомендую всем, кто хочет упростить управление записями.",
      rating: 5,
    },
    {
      name: "Елена Смирнова",
      role: "Администратор фитнес-центра",
      content:
        "С Bagsy мы увеличили количество записей на 40%. Клиенты ценят удобство онлайн-бронирования.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-background via-accent-50 to-background dark:from-background dark:via-background dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Основной CTA */}
        {/* <div className="text-center mb-16">
          <div className="inline-block border-2 border-accent-500 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-6">
              {t("title")}
            </h2>
            <p className="text-xl text-gray-900 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-accent-500 text-white hover:bg-accent-600 border-2 border-accent-500 hover:border-accent-600"
            >
              {t("button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div> */}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center border-2 border-accent-500/30 rounded-xl p-6 hover:border-accent-500/60 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-accent-500" />
            </div>
            <div className="text-3xl font-bold text-black dark:text-white mb-2">
              80+
            </div>
            <div className="text-gray-900 dark:text-gray-300">
              {t("clients")}
            </div>
          </div>
          <div className="text-center border-2 border-accent-500/30 rounded-xl p-6 hover:border-accent-500/60 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-accent-500" />
            </div>
            <div className="text-3xl font-bold text-black dark:text-white mb-2">
              500+
            </div>
            <div className="text-gray-900 dark:text-gray-300">
              {t("records")}
            </div>
          </div>
          <div className="text-center border-2 border-accent-500/30 rounded-xl p-6 hover:border-accent-500/60 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <Star className="h-12 w-12 text-accent-500" />
            </div>
            <div className="text-3xl font-bold text-black dark:text-white mb-2">
              4.9/5
            </div>
            <div className="text-gray-900 dark:text-gray-300">
              {t("rating")}
            </div>
          </div>
        </div>

        {/* Отзывы */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-2 border-accent-500/30 hover:border-accent-500/60 text-black dark:text-white transition-all duration-300"
            >
              <div className="p-6">
                {/* Рейтинг */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Текст отзыва */}
                <p className="text-gray-900 dark:text-gray-300 mb-4 leading-relaxed">
                  {`"${testimonial.content}"`}
                </p>

                {/* Автор */}
                <div>
                  <div className="font-semibold text-black dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
