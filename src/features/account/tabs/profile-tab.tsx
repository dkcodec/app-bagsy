"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader, Copy } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Skeleton,
} from "@/src/entities";
import {
  useUpdateAccount,
  useMediaUpload,
  useDeleteAvatar,
  useLocation,
} from "@/src/shared/hooks";
import { formatRole } from "@/src/shared/utils/format-role";
import { formatDateOnly } from "@/src/shared/utils/formater";
import type { IEmployeeDto } from "@/src/shared/types/user";

interface ProfileTabProps {
  user?: IEmployeeDto;
  isLoading?: boolean;
}

/**
 * Таб «Профиль» — личные данные, бизнес, аккаунт
 */
export function ProfileTab({ user, isLoading }: ProfileTabProps) {
  const t = useTranslations("Account.Profile");
  const locale = useLocale();
  const updateProfile = useUpdateAccount();
  const uploadAvatar = useMediaUpload();
  const deleteAvatar = useDeleteAvatar();
  const { data: location } = useLocation(user?.location_id);

  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Превью выбранного файла
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "";

  const profileSchema = z.object({
    firstName: z.string().min(2, t("nameMinError")),
    lastName: z.string().min(2, t("surnameMinError")),
  });
  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
    },
  });

  useEffect(() => {
    if (user) reset({ firstName: user.first_name, lastName: user.last_name });
  }, [user]);

  const onSubmitName = async (data: ProfileFormData) => {
    const updateData: {
      first_name: string;
      last_name: string;
      avatar_id?: string;
    } = {
      first_name: data.firstName,
      last_name: data.lastName,
    };
    if (selectedFile) {
      try {
        updateData.avatar_id = await uploadAvatar.mutateAsync({
          file: selectedFile,
          purpose: "avatars",
        });
      } catch {
        toast.error(t("uploadError"));
        return;
      }
    }
    try {
      await updateProfile.mutateAsync(updateData);
      setSelectedFile(null);
      setIsEditingName(false);
      reset();
      toast.success(t("profileUpdatedSuccessfully"));
    } catch {
      toast.error(t("errorUpdatingProfile"));
    }
  };

  const handleCancelEdit = () => {
    setSelectedFile(null);
    reset();
    setIsEditingName(false);
  };

  const handleRemoveAvatar = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      return;
    }
    if (!user?.avatar_url) return;
    try {
      await deleteAvatar.mutateAsync();
      toast.success(t("avatarRemovedSuccess"));
    } catch {
      toast.error(t("errorRemovingAvatar"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("сopied"));
  };

  // -- Скелетон для всего таба --
  if (isLoading) {
    return <ProfileTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Аватар + имя header */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) setSelectedFile(f);
              e.target.value = "";
            }}
          />
          <span
            role="button"
            tabIndex={0}
            onClick={() => isEditingName && fileInputRef.current?.click()}
            onKeyDown={e =>
              isEditingName &&
              (e.key === "Enter" || e.key === " ") &&
              fileInputRef.current?.click()
            }
            className={`rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring ${isEditingName ? "cursor-pointer" : ""}`}
            title={isEditingName ? t("changePhoto") : undefined}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={previewUrl ?? user?.avatar_url} alt="" />
              <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </span>
          {/* Удалить фото */}
          {isEditingName && (user?.avatar_url || selectedFile) && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              disabled={deleteAvatar.isPending}
              onClick={handleRemoveAvatar}
            >
              {deleteAvatar.isPending ? (
                <Loader className="size-3 animate-spin" />
              ) : (
                t("removePhoto")
              )}
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium truncate">
            {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.role ? formatRole(user.role, locale) : ""}
          </p>
        </div>
        {isEditingName ? (
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleCancelEdit}
          >
            {t("cancel")}
          </button>
        ) : (
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
            onClick={() => setIsEditingName(true)}
          >
            {t("changePhoto")}
          </button>
        )}
      </div>

      {/* Личная информация */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("personalInfo")}
        </p>
        <div className="rounded-lg border border-border divide-y divide-border">
          {/* Полное имя */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{t("fullName")}</p>
              {isEditingName ? (
                <form
                  onSubmit={handleSubmit(onSubmitName)}
                  className="flex gap-2 mt-1"
                >
                  <div className="flex-1">
                    <Input
                      {...register("firstName")}
                      placeholder={t("firstName")}
                      className="h-8 text-sm"
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-xs mt-0.5">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      {...register("lastName")}
                      placeholder={t("lastName")}
                      className="h-8 text-sm"
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-xs mt-0.5">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8"
                    disabled={isSubmitting || uploadAvatar.isPending}
                  >
                    {isSubmitting ? (
                      <Loader className="size-3 animate-spin" />
                    ) : (
                      t("save")
                    )}
                  </Button>
                </form>
              ) : (
                <p className="text-sm mt-0.5">
                  {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()}
                </p>
              )}
            </div>
            {!isEditingName && (
              <span
                className="text-sm text-primary cursor-pointer shrink-0 ml-4"
                onClick={() => setIsEditingName(true)}
              >
                {t("edit")}
              </span>
            )}
          </div>

          {/* Телефон */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-xs text-muted-foreground">{t("phone")}</p>
              <p className="text-sm mt-0.5">{user?.phone ?? "—"}</p>
            </div>
          </div>

          {/* Роль */}
          <div className="px-4 py-3.5">
            <p className="text-xs text-muted-foreground">{t("role")}</p>
            <p className="text-sm mt-0.5">
              {user?.role ? formatRole(user.role, locale) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Бизнес */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("business")}
        </p>
        <div className="rounded-lg border border-border divide-y divide-border">
          {/* Локация — название + мелкий ID снизу */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-xs text-muted-foreground">{t("location")}</p>
              <p className="text-sm mt-0.5">
                {location?.name ?? user?.location_id ?? "—"}
              </p>
              {location?.name && user?.location_id && (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                  {user.location_id}
                </p>
              )}
            </div>
            {location?.name && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                onClick={() => copyToClipboard(location?.name)}
              >
                <Copy className="size-3" />
                {t("copy")}
              </button>
            )}
          </div>

          {/* Организация — ID с кнопкой копирования */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("organizationId")}
              </p>
              <p className="text-sm mt-0.5 font-mono text-muted-foreground">
                {user?.organization_id ?? "—"}
              </p>
            </div>
            {user?.organization_id && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                onClick={() => copyToClipboard(user.organization_id)}
              >
                <Copy className="size-3" />
                {t("copy")}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Аккаунт */}
      <section>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {t("account")}
        </p>
        <div className="rounded-lg border border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-xs text-muted-foreground">{t("createdAt")}</p>
              <p className="text-sm mt-0.5">
                {formatDateOnly(
                  user?.created_at ?? "",
                  locale === "kz" ? "kk-KZ" : "ru-RU"
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("updatedAt")}</p>
              <p className="text-sm mt-0.5">
                {formatDateOnly(
                  user?.created_at ?? "",
                  locale === "kz" ? "kk-KZ" : "ru-RU"
                )}
              </p>
            </div>
          </div>

          <div className="px-4 py-3.5">
            <span className="text-sm text-destructive cursor-pointer">
              {t("deleteAccount")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Скелетон для ProfileTab */
function ProfileTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Аватар + имя */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Personal info */}
      <div>
        <Skeleton className="h-3 w-32 mb-3" />
        <div className="rounded-lg border border-border divide-y divide-border">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
              {i < 3 && <Skeleton className="h-4 w-14" />}
            </div>
          ))}
        </div>
      </div>

      {/* Business */}
      <div>
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="rounded-lg border border-border divide-y divide-border">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-44" />
              </div>
              {i === 1 && <Skeleton className="h-3 w-20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div>
        <Skeleton className="h-3 w-20 mb-3" />
        <div className="rounded-lg border border-border divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="px-4 py-3.5">
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
