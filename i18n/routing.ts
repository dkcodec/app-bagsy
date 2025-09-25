import { defineRouting } from "next-intl/routing";

export const defaultLocale = "ru";
export const routing = defineRouting({
  locales: ["ru", "kz"],
  defaultLocale: "ru",
  pathnames: {
    "/": "/",
    "/pathnames": {
      kz: "/pathnames",
    },
  },
});
