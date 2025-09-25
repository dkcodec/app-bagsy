import { getTranslations } from "next-intl/server";
import { LandingLogo } from "@/src/widgets/landing-logo";
import { Separator } from "@/src/entities/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { formatPhone } from "../shared/utils/formater";

export async function LandingFooter() {
  const t = await getTranslations("Landing.footer");
  return (
    <footer className="bg-gradient-to-br from-accent-50 via-background to-accent-50 dark:from-accent-950 dark:via-background dark:to-accent-950 border-t border-accent-200 dark:border-accent-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-1">
            <LandingLogo className="h-8 w-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Продукт */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("product")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("features")}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("pricing")}
                </a>
              </li>
              {/* <li>
                <a
                  href="#integrations"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("integrations")}
                </a>
              </li> */}
              {/* <li>
                <a
                  href="#api"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("api")}
                </a>
              </li> */}
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("support")}
            </h3>
            <ul className="space-y-2">
              {/* <li>
                <Link
                  href="#contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("help")}
                </Link>
              </li> */}
              {/* <li>
                <Link
                  href="#docs"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("docs")}
                </Link>
              </li> */}
              {/* <li>
                <a
                  href="#status"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("status")}
                </a>
              </li> */}
              <li>
                <a
                  href="#contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 text-sm transition-colors"
                >
                  {t("contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("contacts")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 text-accent-500" />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
                  className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                >
                  {process.env.NEXT_PUBLIC_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 text-accent-500" />
                <a
                  href={`tel:+${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
                  className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                >
                  {formatPhone(process.env.NEXT_PUBLIC_PHONE_NUMBER || "")}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-accent-500" />
                <span>{t("location")}</span>
              </li>
            </ul>

            {/* Социальные сети */}
            <div className="flex items-center gap-4 mt-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 border-accent-200 dark:border-accent-800" />

        {/* Нижняя часть */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("copyright")}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#privacy"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="#terms"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
