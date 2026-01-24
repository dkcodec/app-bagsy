import { apiClient } from "@/src/shared/api";
import type {
  MediaUploadRequest,
  MediaUploadResponse,
} from "@/src/shared/types/media";

/**
 * Сервис загрузки медиа. POST /api/v1/media/upload — создаёт запись PENDING
 * и возвращает presigned S3 URL для прямой загрузки с клиента.
 */
export class MediaService {
  /**
   * Запрос presigned URL для загрузки файла (далее PUT в S3 на url)
   */
  static async uploadRequest(
    data: MediaUploadRequest
  ): Promise<MediaUploadResponse> {
    return apiClient.post<MediaUploadResponse>("v1/media/upload", data);
  }
}
