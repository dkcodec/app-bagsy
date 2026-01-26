import { apiClient } from "../api/client";

/** Тело запроса POST /api/v1/bagsies/master */
export interface CreateBagsieRequestDto {
  client_phone: string;
  comment?: string;
  master_phone: string;
  name: string;
  service_id: string;
  /** ISO 8601 с offset таймзоны (например 2025-01-25T14:00:00+05:00). */
  start_at: string;
  surname: string;
}

class BagsieService {
  static async createBagsie(payload: CreateBagsieRequestDto) {
    return apiClient.post("v1/bagsies/master", payload);
  }
}

export default BagsieService;
