// middleware.ts (или src/middleware.ts)
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

// ВАЖНО: routing должен быть edge-safe (только plain-объект с locales/defaultLocale)
const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const intlRes = intl(req);
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  const locale = segments[0] || routing.defaultLocale;
  const second = segments[1] ?? "";
  const isLoginPath = second === "login";

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const isAuthenticated = Boolean(accessToken && refreshToken);

  if (!isAuthenticated && !isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  return intlRes || NextResponse.next();
}

export const config = {
  // Проверь, что исключения соответствуют твоим нуждам
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
