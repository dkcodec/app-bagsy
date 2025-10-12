"use client";
import { useMutation } from "@tanstack/react-query";
import BagsieService, {
  CreateBagsieRequestDto,
} from "../services/bagsies-service";

/**
 * Хук для создания записи
 */
export function useCreateBagsie() {
  return useMutation({
    mutationFn: (payload: CreateBagsieRequestDto) => {
      return BagsieService.createBagsie(payload);
    },
  });
}
