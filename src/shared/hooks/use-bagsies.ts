"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BagsieService, {
  CreateBagsieRequestDto,
} from "../services/bagsies-service";

/**
 * Хук для создания записи POST /api/v1/bagsies/master
 */
export function useCreateBagsie() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBagsieRequestDto) =>
      BagsieService.createBagsie(payload),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
