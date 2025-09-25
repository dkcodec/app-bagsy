import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Создаем плагин для next-intl
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Настройка для правильного разрешения путей
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
