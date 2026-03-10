import { apiClient } from "@/src/shared/api";
import type {
  MediaUploadRequest,
  MediaUploadResponse,
} from "@/src/shared/types/media";

/**
 * Сервис загрузки медиа. POST /api/v1/media/upload — создаёт запись PENDING
 * и возвращает presigned S3 URL + upload_fields для загрузки через multipart POST.
 */
export class MediaService {
  /**
   * Запрос presigned URL для загрузки файла
   * Ответ содержит upload_url и upload_fields для multipart POST в S3
   */
  static async uploadRequest(
    data: MediaUploadRequest
  ): Promise<MediaUploadResponse> {
    return apiClient.post<MediaUploadResponse>("api/v1/media/upload", data);
  }

  /**
   * Подтверждение загрузки файла (POST /api/v1/media/{id}/confirm)
   * Проверяет наличие файла в S3 и меняет статус на uploaded
   */
  static async confirmUpload(id: string): Promise<void> {
    await apiClient.post(`api/v1/media/${encodeURIComponent(id)}/confirm`);
  }
}
