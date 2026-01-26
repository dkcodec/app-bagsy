import { apiClient } from "../api/client";

export interface CreateBagsieRequestDto {
  description: string;
  /** ISO 8601 с offset таймзоны пользователя (например 2025-01-25T14:00:00+05:00). */
  end_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  provider: {
    phone: string;
    point_code: string;
  };
  service: string;
  /** ISO 8601 с offset таймзоны пользователя (например 2025-01-25T14:00:00+05:00). */
  start_at: string;
}

class BagsieService {
  static async createBagsie(payload: CreateBagsieRequestDto) {
    return apiClient.post("v1/bagsies/master", payload);
  }
}

export default BagsieService;
