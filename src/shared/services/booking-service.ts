import { apiClient } from "../api/client";

/** Тело запроса POST /api/v1/bookings */
export interface CreateBookingRequest {
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

export interface CreateBookingResponse {
  id: string;
}

/** Запрос доступных слотов POST /api/v1/bookings/slots */
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

/** Подтверждение записи POST /api/v1/bookings/{id}/confirm */
export interface ConfirmBookingRequest {
  code: string;
}

/** Отмена записи POST /api/v1/bookings/{id}/cancel */
export interface CancelBookingRequest {
  reason?: string;
}

/**
 * Сервис бронирований (записей на услуги).
 * Заменяет старый BagsieService.
 */
export class BookingService {
  /** Создание записи на услугу */
  static async createBooking(
    payload: CreateBookingRequest
  ): Promise<CreateBookingResponse> {
    return apiClient.post<CreateBookingResponse>("api/v1/bookings", payload);
  }

  /** Получение доступных слотов */
  static async getSlots(payload: GetSlotsRequest): Promise<GetSlotsResponse> {
    return apiClient.post<GetSlotsResponse>("api/v1/bookings/slots", payload);
  }

  /** Подтверждение записи OTP-кодом */
  static async confirmBooking(
    id: string,
    payload: ConfirmBookingRequest
  ): Promise<void> {
    await apiClient.post(`api/v1/bookings/${id}/confirm`, payload);
  }

  /** Отмена записи */
  static async cancelBooking(
    id: string,
    payload: CancelBookingRequest
  ): Promise<void> {
    await apiClient.post(`api/v1/bookings/${id}/cancel`, payload);
  }

  /** Повторная отправка OTP подтверждения записи */
  static async resendOtp(id: string): Promise<void> {
    await apiClient.post(`api/v1/bookings/${id}/resend-otp`, {});
  }
}

export default BookingService;
