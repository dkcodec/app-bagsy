/**
 * Типы для загрузки медиа (presigned URL + S3)
 */

/** Допустимые назначения медиафайлов */
export type MediaPurpose =
  | "avatars"
  | "organizations"
  | "locations"
  | "services"
  | "service-categories";

/** Запрос на получение presigned URL для загрузки (POST /api/v1/media/upload) */
export interface MediaUploadRequest {
  purpose: MediaPurpose;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

/** Ответ POST /api/v1/media/upload */
export interface MediaUploadResponse {
  asset_id: string;
  upload_url: string;
  upload_fields: Record<string, string>;
}
