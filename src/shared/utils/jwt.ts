export type JwtPayload = Record<string, unknown>;

function base64UrlToString(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  const padded = base64 + (remainder ? "=".repeat(4 - remainder) : "");
  // Декодируем в строку UTF-8
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  try {
    // Превращаем бинарь в строку UTF-8
    return decodeURIComponent(
      binary
        .split("")
        .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    // Фоллбэк если не utf-8
    return binary;
  }
}

export function decodeJwt<T extends JwtPayload = JwtPayload>(token: string): T {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT: missing payload");
  const json = base64UrlToString(parts[1]);
  return JSON.parse(json) as T;
}

// Утилиты для дат: exp/iat/nbf обычно в секундах Unix
export function secondsToDate(seconds?: unknown): Date | null {
  if (typeof seconds !== "number") return null;
  return new Date(seconds * 1000);
}
