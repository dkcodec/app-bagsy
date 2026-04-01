import { apiClient } from "../api/client";

/** Тело запроса POST /api/v1/appointments/direct */
export interface CreateAppointmentRequest {
  phone: string;
  first_name: string;
  last_name: string;
  comment?: string;
  employee_id: string;
  location_id: string;
  service_id: string;
  /** ISO 8601 с offset таймзоны (например 2025-01-25T14:00:00+05:00). */
  start_at: string;
}

export interface CreateAppointmentResponse {
  id: string;
}

/** Запрос доступных слотов POST /api/v1/appointments/slots */
export interface GetSlotsRequest {
  location_id: string;
  service_id: string;
  start_date: string;
  end_date: string;
  /** UUID сотрудника (опционально) */
  employee_id?: string;
}

export interface TimeSlot {
  start_at: string;
  end_at: string;
}

export interface MasterSlot {
  employee_id: string;
  employee_name: string;
  price: number;
  slots: TimeSlot[];
}

export interface GetSlotsResponse {
  location_id: string;
  service_id: string;
  duration_minutes: number;
  master_slots: MasterSlot[];
}

/** Подтверждение записи POST /api/v1/appointments/{id}/confirm */
export interface ConfirmAppointmentRequest {
  code: string;
}

/** Отмена записи POST /api/v1/appointments/{id}/cancel */
export interface CancelAppointmentRequest {
  reason?: string;
}

/**
 * Сервис записей (appointments).
 * Эндпоинты: /api/v1/appointments/*
 */
export class AppointmentService {
  /** Прямое создание записи сотрудником (без OTP) */
  static async createAppointment(
    payload: CreateAppointmentRequest
  ): Promise<CreateAppointmentResponse> {
    return apiClient.post<CreateAppointmentResponse>(
      "api/v1/appointments/direct",
      payload
    );
  }

  /** Получение доступных слотов */
  static async getSlots(payload: GetSlotsRequest): Promise<GetSlotsResponse> {
    return apiClient.post<GetSlotsResponse>(
      "api/v1/appointments/slots",
      payload
    );
  }

  /** Подтверждение записи OTP-кодом */
  static async confirmAppointment(
    id: string,
    payload: ConfirmAppointmentRequest
  ): Promise<void> {
    await apiClient.post(`api/v1/appointments/${id}/confirm`, payload);
  }

  /** Отмена записи */
  static async cancelAppointment(
    id: string,
    payload: CancelAppointmentRequest
  ): Promise<void> {
    await apiClient.post(`api/v1/appointments/${id}/cancel`, payload);
  }

  /** Повторная отправка OTP подтверждения записи */
  static async resendOtp(id: string): Promise<void> {
    await apiClient.post(`api/v1/appointments/${id}/resend-otp`, {});
  }
}

export default AppointmentService;
