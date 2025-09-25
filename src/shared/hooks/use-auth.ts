/**
 * Хуки для работы с авторизацией
 * Используют Tanstack Query для управления состоянием
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../api/services";
import type { LoginRequest, User } from "../api/types";

// Ключи для кэширования
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  refresh: () => [...authKeys.all, "refresh"] as const,
};

/**
 * Хук для получения текущего пользователя
 * Автоматически обновляет данные при изменении
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authService.getCurrentUser,
    // Не рефетчить если пользователь не авторизован
    enabled: typeof window !== "undefined",
    // Время жизни кэша - 10 минут
    staleTime: 10 * 60 * 1000,
    // Время до удаления из кэша - 30 минут
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Хук для входа в систему
 * Обрабатывает логин и обновляет кэш пользователя
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: data => {
      // Обновляем кэш пользователя
      // queryClient.setQueryData(authKeys.user(), data.user);
      // Инвалидируем все запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Перенаправляем на дашборд
      router.push("/dashboard");
    },
    onError: error => {
      console.error("Ошибка входа:", error);
    },
  });
}

/**
 * Хук для выхода из системы
 * Очищает кэш и перенаправляет на страницу входа
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Очищаем весь кэш
      queryClient.clear();
      // Перенаправляем на страницу входа
      router.push("/login");
    },
    onError: error => {
      console.error("Ошибка выхода:", error);
      // Даже при ошибке очищаем кэш и перенаправляем
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Хук для обновления токена
 * Автоматически вызывается при ошибках авторизации
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.refresh,
    onSuccess: data => {
      // Обновляем кэш пользователя
      queryClient.setQueryData(authKeys.user(), data.user);
    },
    onError: error => {
      console.error("Ошибка обновления токена:", error);
      // При ошибке обновления токена очищаем кэш
      queryClient.clear();
    },
  });
}

/**
 * Хук для проверки авторизации
 * Возвращает состояние авторизации и пользователя
 */
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();
  const logout = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isUnauthenticated: !user && !isLoading,
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
  };
}

/**
 * Хук для защищенных маршрутов
 * Автоматически перенаправляет неавторизованных пользователей
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Если загрузка завершена и пользователь не авторизован
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
  }

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
