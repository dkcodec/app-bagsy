"use client";

import { useMutation } from "@tanstack/react-query";
import { MediaService } from "../services/media-service";

/** Допустимые MIME для аватара */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Хук загрузки аватара: POST v1/media/upload → presigned URL, затем PUT в S3.
 * Возвращает media_id для передачи в PUT v1/users/me { avatar_id }.
 * Валидация: image/jpeg, image/png, image/webp, до 5 MB.
 */
export function useMediaUpload() {
  return useMutation<string, Error, File>({
    mutationKey: ["media", "upload"],
    mutationFn: async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
        throw new Error(
          "Недопустимый формат. Разрешены: JPEG, PNG, WebP."
        );
      }
      if (file.size > MAX_SIZE_BYTES) {
        throw new Error("Размер файла не должен превышать 5 MB.");
      }

      const { url, media_id } = await MediaService.uploadRequest({
        content_type: file.type,
        filename: file.name,
        purpose: "avatar",
      });

      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) {
        throw new Error(`Ошибка загрузки в хранилище: ${res.status}`);
      }

      return media_id;
    },
  });
}
