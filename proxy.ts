import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const intlRes = intl(req);
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Валидируем локаль: первый сегмент должен быть из списка routing.locales.
  // Иначе путь без префикса ("/login") интерпретировался как locale="login",
  // second=undefined → редирект уходил на "/login/login".
  const firstSeg = segments[0];
  const isKnownLocale =
    !!firstSeg && (routing.locales as readonly string[]).includes(firstSeg);
  const locale = isKnownLocale ? firstSeg : routing.defaultLocale;
  // Сегменты пути без локали (для определения раздела)
  const pathSegments = isKnownLocale ? segments.slice(1) : segments;
  const second = pathSegments[0] ?? "";
  const isLoginPath = second === "login";
  const isInvitePath = second === "invite";

  const refreshToken = req.cookies.get("refresh_token")?.value;
  const isAuthenticated = Boolean(refreshToken);

  // Добавляем pathname в headers для использования в Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!isAuthenticated && !isLoginPath && !isInvitePath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    const response = NextResponse.redirect(url);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  if (isAuthenticated && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    const response = NextResponse.redirect(url);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Если используем intl response, добавляем header к нему
  if (intlRes) {
    intlRes.headers.set("x-pathname", pathname);
    return intlRes;
  }

  // Иначе создаём новый response с headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
