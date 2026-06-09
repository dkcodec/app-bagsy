/**
 * Извлекает ключ ошибки из API-ответа для перевода через apiErrors.*
 * Ожидает body вида { error: "permission_denied" }
 */
export function getApiErrorKey(error: unknown): string {
  if (error && typeof error === "object") {
    const body = (error as { body?: unknown }).body;
    if (body && typeof body === "object") {
      const key = (body as { error?: string }).error;
      if (key && typeof key === "string") return key;
    }
  }
  return "unknown";
}
