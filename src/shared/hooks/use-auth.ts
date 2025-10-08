"use client";
import { useMutation } from "@tanstack/react-query";
import {
  AuthService,
  type LoginRequestDto,
  type LoginResponseDto,
} from "../services";
import { setAuthTokens } from "../utils/cookies";

/**
 * Мутация для логина пользователя
 * Возвращает статус, данные и метод mutateAsync
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
