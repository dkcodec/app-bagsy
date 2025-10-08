// Типы для конфигурации куки
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

// Конфигурация по умолчанию для токенов
const DEFAULT_TOKEN_OPTIONS: CookieOptions = {
  maxAge: 7 * 24 * 60 * 60, // 7 дней
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: false, // Доступ с клиента для JS
  sameSite: "lax",
};

/**
 * Устанавливает куки с заданными параметрами
 * Работает как на клиенте, так и на сервере
 */
export async function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_TOKEN_OPTIONS, ...options };

  // Проверяем, работаем ли мы на сервере
  if (typeof window === "undefined") {
    // Серверная работа - используем next/headers
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(name, value, mergedOptions);
  } else {
    // Клиентская работа - используем document.cookie
    const cookieString = buildCookieString(name, value, mergedOptions);
    document.cookie = cookieString;
  }
}

/**
 * Получает значение куки по имени
 */
export async function getCookie(name: string): Promise<string | undefined> {
  if (typeof window === "undefined") {
    // Серверная работа
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  } else {
    // Клиентская работа
    const value = document.cookie
      .split("; ")
      .find(row => row.startsWith(`${name}=`))
      ?.split("=")[1];
    return value;
  }
}

/**
 * Удаляет куки
 */
export async function removeCookie(name: string): Promise<void> {
  await setCookie(name, "", {
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Устанавливает токены авторизации
 */
export async function setAuthTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    setCookie("access_token", accessToken, {
      maxAge: 15 * 60, // 15 минут
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }),
    setCookie("refresh_token", refreshToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 дней
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }),
  ]);
}

/**
 * Получает токен доступа
 */
export async function getAccessToken(): Promise<string | undefined> {
  return getCookie("access_token");
}

/**
 * Получает refresh токен
 */
export async function getRefreshToken(): Promise<string | undefined> {
  return getCookie("refresh_token");
}

/**
 * Очищает все токены авторизации
 */
export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    removeCookie("access_token"),
    removeCookie("refresh_token"),
  ]);
}

/**
 * Строит строку куки для клиентской работы
 */
function buildCookieString(
  name: string,
  value: string,
  options: CookieOptions
): string {
  let cookieString = `${name}=${value}`;

  if (options.maxAge !== undefined) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }

  if (options.expires) {
    cookieString += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; Path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += "; Secure";
  }

  if (options.httpOnly) {
    cookieString += "; HttpOnly";
  }

  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }

  return cookieString;
}
