"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthService,
  type LoginRequestDto,
  type LoginResponseDto,
  type RegisterRequestDto,
  type RegisterResponseDto,
  type PasswordChangeRequestDto,
  type PasswordChangeResponseDto,
} from "../services";
import { setAuthTokens } from "../utils/cookies";
import { useRouter } from "next/navigation";

/**
 * Мутация для логина пользователя
 * Возвращает статус и метод mutateAsync
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<LoginResponseDto, unknown, LoginRequestDto>({
    mutationKey: ["auth", "login"],
    mutationFn: (payload: LoginRequestDto) => AuthService.login(payload),
    onSuccess: async data => {
      await setAuthTokens(data.access_token, data.refresh_token);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<void, unknown, void>({
    mutationKey: ["auth", "logout"],
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.refresh();
    },
  });
}

/**
 * Мутация для регистрации пароля пользователя
 * Возвращает статус и метод mutateAsync
 */
export function useRegisterConfirm() {
  const router = useRouter();
  return useMutation<RegisterResponseDto, unknown, RegisterRequestDto>({
    mutationKey: ["auth", "register"],
    mutationFn: (payload: RegisterRequestDto) =>
      AuthService.registerConfirm(payload),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

/**
 * Мутация для обновления токена доступа
 * Возвращает статус и метод mutateAsync
 */
export function useRefreshToken() {
  return useMutation<LoginResponseDto, unknown, void>({
    mutationKey: ["auth", "refreshToken"],
    mutationFn: () => AuthService.refreshToken(),
    onSuccess: async data => {
      await setAuthTokens(data.access_token, data.refresh_token);
    },
  });
}

export function usePasswordChange() {
  const router = useRouter();
  const logoutMutation = useLogout();
  return useMutation<
    PasswordChangeResponseDto,
    unknown,
    PasswordChangeRequestDto
  >({
    mutationKey: ["auth", "passwordChange"],
    mutationFn: (payload: PasswordChangeRequestDto) =>
      AuthService.passwordChange(payload),
    onSuccess: async () => {
      await logoutMutation.mutateAsync();
      router.push("/login");
    },
  });
}
