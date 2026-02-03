import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

// Плагин next-intl
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Ревизия для precache (при обновлении SW инвалидируется кэш)
const revision = crypto.randomUUID?.() ?? Date.now().toString();

// PWA: Serwist — офлайн-кэш и precache (только в production; Turbopack не поддерживается)
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  register: true,
  scope: "/",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // PWA: безопасные заголовки (глобально + для SW)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
