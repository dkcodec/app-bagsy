import { defineRouting } from "next-intl/routing";

export const defaultLocale = "ru";
// Без pathnames — next-intl router принимает любые пути типизировано как
// string. Демо-блок "/pathnames" в проекте не использовался.
export const routing = defineRouting({
  locales: ["ru", "kz"],
  defaultLocale: "ru",
});
