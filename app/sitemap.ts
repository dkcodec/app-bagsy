import type { MetadataRoute } from "next";

// Dynamic sitemap for localized routes
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bagsy.kz";
const locales = ["ru", "kz"] as const;

// List only real, indexable paths (exclude bare "/" because it redirects)
const localizedPaths = ["", "/dashboard"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return locales.flatMap(locale =>
    localizedPaths.map(path => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "" ? 1.0 : 0.7,
    }))
  );
}
