import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const intlRes = intl(req);
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  const locale = segments[0] || routing.defaultLocale;
  const second = segments[1] ?? "";
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
