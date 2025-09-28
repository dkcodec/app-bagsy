"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * Провайдер для Tanstack Query
 * Настроен для SSR, кэширования и обработки ошибок
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Создаем QueryClient с настройками
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Время жизни кэша - 5 минут
            staleTime: 5 * 60 * 1000,
            // Время до удаления из кэша - 10 минут
            gcTime: 10 * 60 * 1000,
            // Количество повторных попыток при ошибке
            retry: (failureCount, error) => {
              // Не повторяем для ошибок авторизации
              if (error && typeof error === "object" && "status" in error) {
                const status = (error as { status?: number }).status;
                if (status === 401 || status === 403) {
                  return false;
                }
              }
              // Максимум 3 попытки для других ошибок
              return failureCount < 3;
            },
            // Интервал между повторными попытками
            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            // Не рефетчить при фокусе окна (экономия трафика)
            refetchOnWindowFocus: false,
            // Не рефетчить при восстановлении соединения
            refetchOnReconnect: true,
            // Не рефетчить при монтировании компонента если данные свежие
            refetchOnMount: true,
          },
          mutations: {
            // Количество повторных попыток для мутаций
            retry: (failureCount, error) => {
              // Не повторяем для ошибок авторизации
              if (error && typeof error === "object" && "status" in error) {
                const status = (error as { status?: number }).status;
                if (status === 401 || status === 403) {
                  return false;
                }
              }
              // Максимум 1 попытка для мутаций
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools только в development режиме */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
