/**
 * Страница-заглушка при офлайн (PWA fallback).
 * Показывается Serwist, когда запрос document не может быть выполнен из сети/кэша.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Нет подключения</h1>
      <p className="text-muted-foreground">
        Проверьте интернет и обновите страницу.
      </p>
    </main>
  );
}
