// middleware.ts (или src/middleware.ts)
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

// ВАЖНО: routing должен быть edge-safe (только plain-объект с locales/defaultLocale)
const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // 1) Даем next-intl шанс сделать всё своё
  const intlRes = intl(req);

  // 2) Дальше — твоя авторизация (URL уже нормализован next-intl)
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // ожидаем /{locale}/...
  const locale = segments[0];
  const second = segments[1] ?? "";
  const isLoginPath = second === "login";
  const isLocaleRoot = segments.length === 1; // "/{locale}"

  // Проверяем только корень дашборда и /login
  if (!isLocaleRoot && !isLoginPath) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const isAuthenticated = Boolean(accessToken && refreshToken);

  if (intlRes && isAuthenticated) {
    return intlRes;
  }
  console.log("intlRes 2");

  if (!isAuthenticated && isLocaleRoot) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Проверь, что исключения соответствуют твоим нуждам
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
