"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppointmentService,
  type CreateAppointmentRequest,
  type CreateAppointmentResponse,
  type CancelAppointmentRequest,
} from "../services/appointment-service";

/**
 * Хук для создания записи POST /api/v1/appointments/direct
 */
export function useCreateAppointment() {
  const q = useQueryClient();
  return useMutation<
    CreateAppointmentResponse,
    unknown,
    CreateAppointmentRequest
  >({
    mutationFn: (payload: CreateAppointmentRequest) =>
      AppointmentService.createAppointment(payload),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

/**
 * Хук для отмены записи POST /api/v1/appointments/{id}/cancel
 */
export function useCancelAppointment() {
  const q = useQueryClient();
  return useMutation<void, unknown, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) =>
      AppointmentService.cancelAppointment(id, {
        reason,
      } as CancelAppointmentRequest),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
