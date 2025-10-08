"use client";
import { useMutation } from "@tanstack/react-query";
import {
  AuthService,
  type LoginRequestDto,
  type LoginResponseDto,
  type RegisterRequestDto,
  type RegisterResponseDto,
} from "../services";
import { setAuthTokens } from "../utils/cookies";
import { useRouter } from "next/navigation";

/**
 * Мутация для логина пользователя
 * Возвращает статус и метод mutateAsync
 */
export function useLogin() {
  return useMutation<LoginResponseDto, unknown, LoginRequestDto>({
    mutationKey: ["auth", "login"],
    mutationFn: (payload: LoginRequestDto) => AuthService.login(payload),
    onSuccess: async data => {
      await setAuthTokens(data.data.access_token, data.data.refresh_token);
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
