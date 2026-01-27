/**
 * Типы для загрузки медиа (presigned URL + S3)
 */

/** Запрос на получение presigned URL для загрузки */
export interface MediaUploadRequest {
  content_type: string;
  filename: string;
  purpose: string;
}

/** Ответ POST /api/v1/media/upload */
export interface MediaUploadResponse {
  expires_at: string;
  media_id: string;
  url: string;
}
