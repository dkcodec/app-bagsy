"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/src/entities/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/widgets/dropdown-menu";
import { Globe } from "lucide-react";

// Конфигурация языков
const locales = [
  { code: "ru", name: "russian" },
  { code: "kz", name: "kazakh" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Landing.header");

  // Получаем текущий язык
  const currentLocale = locales.find(l => l.code === locale);

  // Обработчик смены языка
  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t(currentLocale?.name || "")}
          </span>
          <span className="sm:hidden">{currentLocale?.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(localeOption => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => handleLocaleChange(localeOption.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{localeOption.code}</span>
            {t(localeOption.name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
