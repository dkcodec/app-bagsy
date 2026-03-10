"use client";

import { useMutation } from "@tanstack/react-query";
import { MediaService } from "../services/media-service";
import type { MediaPurpose } from "../types/media";

/** Допустимые MIME для аватара */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Хук загрузки медиа: POST /api/v1/media/upload → presigned URL,
 * затем multipart POST в S3 с upload_fields, затем POST /api/v1/media/{id}/confirm.
 * Возвращает asset_id для передачи в PUT /api/v1/employees/me { avatar_id }.
 * Валидация: image/jpeg, image/png, image/webp, до 5 MB.
 */
export function useMediaUpload() {
  return useMutation<string, Error, { file: File; purpose?: MediaPurpose }>({
    mutationKey: ["media", "upload"],
    mutationFn: async ({ file, purpose = "avatars" }) => {
      if (
        !ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])
      ) {
        throw new Error("Недопустимый формат. Разрешены: JPEG, PNG, WebP.");
      }
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error("Размер файла не должен превышать 5 MB.");
      }

      // 1. Получаем presigned URL и upload_fields
      const { upload_url, upload_fields, asset_id } =
        await MediaService.uploadRequest({
          mime_type: file.type,
          filename: file.name,
          purpose,
          size_bytes: file.size,
        });

      // 2. Загружаем файл в S3 через multipart POST
      const formData = new FormData();
      // Сначала добавляем все поля из upload_fields
      Object.entries(upload_fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Файл должен быть последним полем
      formData.append("file", file);

      const res = await fetch(upload_url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Ошибка загрузки в хранилище: ${res.status}`);
      }

      // 3. Подтверждаем загрузку
      await MediaService.confirmUpload(asset_id);

      return asset_id;
    },
  });
}
