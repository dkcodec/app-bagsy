"use client";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "../services/user-service";
import { getAccessToken } from "../utils/cookies";
import { decodeJwt, type JwtPayload } from "../utils/jwt";

interface AccessTokenPayload extends JwtPayload {
  phone?: string;
  sub?: string;
}

/**
 * Получение текущего пользователя по номеру телефона из access_token
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      const payload = decodeJwt<AccessTokenPayload>(token);
      const phone = payload.phone || payload.sub;
      if (!phone) throw new Error("Phone is missing in token");
      return UserService.getUserByPhone(phone);
    },
    staleTime: 30 * 60 * 1000, // 30 минут - пользователь не меняется часто
    gcTime: 60 * 60 * 1000, // 1 час в кеше
    retry: 1,
    refetchOnWindowFocus: false, // не перезапрашивать при фокусе окна
    refetchOnMount: false, // не перезапрашивать при монтировании если есть кеш
  });
}

/**
 * Получение информации о пользователе по номеру телефона
 */
export function useGetUserByPhone(phone: string) {
  return useQuery({
    queryKey: ["user", phone],
    queryFn: () => UserService.getUserByPhone(phone),
    staleTime: 5 * 60 * 1000,
  });
}
