"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookingService,
  type CreateBookingRequest,
  type CreateBookingResponse,
  type CancelBookingRequest,
} from "../services/booking-service";

/**
 * Хук для создания записи POST /api/v1/bookings
 */
export function useCreateBooking() {
  const q = useQueryClient();
  return useMutation<CreateBookingResponse, unknown, CreateBookingRequest>({
    mutationFn: (payload: CreateBookingRequest) =>
      BookingService.createBooking(payload),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

/** @deprecated Используй useCreateBooking */
export const useCreateBagsie = useCreateBooking;

/**
 * Хук для отмены записи POST /api/v1/bookings/{id}/cancel
 */
export function useCancelBooking() {
  const q = useQueryClient();
  return useMutation<void, unknown, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) =>
      BookingService.cancelBooking(id, { reason } as CancelBookingRequest),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
