import { apiClient } from "../api/client";

export interface CreateBagsieRequestDto {
  description: string;
  end_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  provider: {
    phone: string;
    point_code: string;
  };
  service: string;
  start_at: string;
}

class BagsieService {
  static async createBagsie(payload: CreateBagsieRequestDto) {
    return apiClient.post("v1/bagsies/create", payload);
  }
}

export default BagsieService;
