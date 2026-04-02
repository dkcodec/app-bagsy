"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthService,
  type LoginRequestDto,
  type LoginResponseDto,
  type PasswordResetRequestDto,
  type PasswordResetResponseDto,
  type PasswordResetConfirmRequestDto,
  type PasswordResetConfirmResponseDto,
} from "../services";
import {
  EmployeeService,
  type ConfirmInviteRequest,
  type ConfirmInviteResponse,
} from "../services/employee-service";
import { setAuthTokens, clearAuthTokens } from "../utils/cookies";
import { useCalendarStore } from "@/src/features/calendar/calendar-context/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

/**
 * Мутация для логина пользователя
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
      queryClient.clear(); // Полностью очищаем весь кэш при логауте
      useCalendarStore.persist.clearStorage(); // Очищаем localStorage
      useCalendarStore.setState({
        locationId: undefined,
        badgeVariant: "colored",
      }); // Сбрасываем in-memory состояние
      router.refresh();
    },
  });
}

/**
 * Мутация для подтверждения инвайта сотрудника (установка пароля)
 * Заменяет старый useRegisterConfirm
 */
export function useConfirmInvite() {
  const router = useRouter();
  return useMutation<ConfirmInviteResponse, unknown, ConfirmInviteRequest>({
    mutationKey: ["auth", "confirmInvite"],
    mutationFn: (payload: ConfirmInviteRequest) =>
      EmployeeService.confirmInvite(payload),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

/** @deprecated Используй useConfirmInvite */
export const useRegisterConfirm = useConfirmInvite;

/**
 * Мутация для обновления токена доступа
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

/** Запрос на сброс пароля (отправляет ссылку) */
export function usePasswordReset() {
  const t = useTranslations("Auth.PasswordChangeRequest");
  return useMutation<
    PasswordResetResponseDto,
    unknown,
    PasswordResetRequestDto
  >({
    mutationKey: ["auth", "passwordReset"],
    mutationFn: (payload: PasswordResetRequestDto) =>
      AuthService.passwordReset(payload),
    onSuccess: () => {
      toast.success(t("passwordChangeRequestSuccess"));
    },
    onError: () => {
      toast.error(t("passwordChangeRequestError"));
    },
  });
}

/** @deprecated Используй usePasswordReset */
export const usePasswordChangeRequest = usePasswordReset;

/** Подтверждение сброса пароля (установка нового) */
export function usePasswordResetConfirm() {
  const t = useTranslations("Auth.PasswordChange");
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<
    PasswordResetConfirmResponseDto,
    unknown,
    PasswordResetConfirmRequestDto
  >({
    mutationKey: ["auth", "passwordResetConfirm"],
    mutationFn: (payload: PasswordResetConfirmRequestDto) =>
      AuthService.passwordResetConfirm(payload),
    onSuccess: async () => {
      await clearAuthTokens();
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(t("passwordChangeSuccess"));
      router.push("/");
    },
    onError: () => {
      toast.error(t("passwordChangeError"));
    },
  });
}

/** @deprecated Используй usePasswordResetConfirm */
export const usePasswordChange = usePasswordResetConfirm;
