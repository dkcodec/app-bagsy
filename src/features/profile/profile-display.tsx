"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Skeleton,
  Button,
  Input,
} from "@/src/entities";
import { IUserDto } from "@/src/shared/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  usePasswordChangeRequest,
  useUpdateProfile,
  useMediaUpload,
  useDeleteAvatar,
} from "@/src/shared/hooks";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { formatRole } from "@/src/shared/utils/format-role";
import { formatDateOnly } from "@/src/shared/utils/formater";

interface ProfileDisplayProps {
  user?: IUserDto;
  isLoading?: boolean;
}

/**
 * Компонент отображения информации о пользователе
 * Показывает аватар, основную информацию и статус
 */
export function ProfileDisplay({ user, isLoading }: ProfileDisplayProps) {
  const t = useTranslations("Profile.ProfileDisplay");
  const locale = useLocale();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useMediaUpload();
  const deleteAvatar = useDeleteAvatar();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordChangeRequestMutation = usePasswordChangeRequest();

  // Превью выбранного файла; cleanup revokeObjectURL
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);
  // Генерируем инициалы для аватара
  const initials = user
    ? `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase()
    : "";

  // Определяем статус пользователя
  const getStatusVariant = (isActive: boolean) =>
    isActive ? "default" : "secondary";

  const getStatusText = (isActive: boolean) =>
    isActive ? t("active") : t("inactive");

  const profileSchema = z.object({
    name: z.string().min(2, t("nameMinError")),
    surname: z.string().min(2, t("surnameMinError")),
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
      name: user?.name ?? "",
      surname: user?.surname ?? "",
    },
  });

  useEffect(() => {
    if (user)
      reset({
        name: user.name,
        surname: user.surname,
      });
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    const updateData: { name: string; surname: string; avatar_id?: string } = {
      name: data.name,
      surname: data.surname,
    };
    if (selectedFile) {
      try {
        updateData.avatar_id = await uploadAvatar.mutateAsync(selectedFile);
      } catch {
        toast.error(t("uploadError"));
        return;
      }
    }
    try {
      await updateProfile.mutateAsync(updateData);
      setSelectedFile(null);
      setIsEditing(false);
      reset();
      toast.success(t("profileUpdatedSuccessfully"));
    } catch (error) {
      toast.error(t("errorUpdatingProfile"));
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    reset();
    setIsEditing(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Аватар и основная информация */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center gap-1">
              {/* В режиме редактирования — клик по аватару открывает выбор файла */}
              {isEditing ? (
                <>
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
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={e =>
                      (e.key === "Enter" || e.key === " ") &&
                      fileInputRef.current?.click()
                    }
                    className="cursor-pointer rounded-2xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
                    title={t("changePhoto")}
                  >
                    <Avatar className="h-16 w-16 rounded-2xl">
                      <AvatarImage
                        src={previewUrl ?? user?.avatar_url}
                        alt=""
                      />
                      <AvatarFallback className="text-lg font-semibold">
                        {isLoading ? (
                          <Skeleton className="h-16 w-16 rounded-2xl" />
                        ) : (
                          initials
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </>
              ) : (
                <Avatar className="h-16 w-16 rounded-2xl">
                  <AvatarImage
                    src={user?.avatar_url}
                    alt={user?.name ?? "avatar"}
                  />
                  <AvatarFallback className="text-lg font-semibold rounded-2xl">
                    {isLoading ? (
                      <Skeleton className="h-16 w-16 rounded-2xl" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
              )}
              {/* Удалить фото — в режиме редактирования при наличии аватара или выбранного файла */}
              {isEditing && (user?.avatar_url || selectedFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2.5 py-0.5 text-muted-foreground hover:text-white hover:bg-destructive"
                  disabled={deleteAvatar.isPending}
                  onClick={handleRemoveAvatar}
                >
                  {deleteAvatar.isPending ? (
                    <Loader className="size-3 animate-loader" />
                  ) : (
                    t("removePhoto")
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : isEditing ? (
                  // Инлайн-редактирование имени и фамилии
                  <div className="flex gap-2">
                    <div className="">
                      <Input
                        id="name"
                        className="w-full bg-transparent outline-hidden border-b border-muted-foreground/40 focus:border-primary transition-colors"
                        {...register("name")}
                        placeholder={user?.name ?? t("name")}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="">
                      <Input
                        id="surname"
                        className="w-full bg-transparent outline-hidden border-b border-muted-foreground/40 focus:border-primary transition-colors"
                        {...register("surname")}
                        placeholder={user?.surname ?? t("surname")}
                        disabled={isSubmitting}
                      />
                      {errors.surname && (
                        <p className="text-destructive text-sm">
                          {errors.surname.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  `${user?.name ?? ""} ${user?.surname ?? ""}`.trim()
                )}
              </h3>
              <div className="text-sm text-muted-foreground">
                {isLoading ? <Skeleton className="h-4 w-24" /> : user?.phone}
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant={getStatusVariant(user?.active || false)}>
                  {getStatusText(user?.active || false)}
                </Badge>
              )}
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("role")}
              </h4>
              <div className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : user?.role ? (
                  formatRole(user.role, locale)
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("pointCode")}
              </h4>
              <div className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  (user?.point_code ?? "-")
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("networkCode")}
              </h4>
              <div className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  (user?.network_code ?? "-")
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("createdAt")}
              </h4>
              <div className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  formatDateOnly(
                    user?.created_at ?? "",
                    locale === "kz" ? "kk-KZ" : "ru-RU"
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("updatedAt")}
              </h4>
              <div className="text-sm">
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  formatDateOnly(
                    user?.updated_at ?? "",
                    locale === "kz" ? "kk-KZ" : "ru-RU"
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Кнопка редактирования профиля */}
            <Button
              type={isEditing ? "submit" : "button"}
              onClick={
                !isEditing
                  ? (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }
                  : handleSubmit(onSubmit)
              }
              disabled={isSubmitting || uploadAvatar.isPending}
              className="flex-1"
            >
              {isEditing ? (
                isSubmitting ? (
                  <Loader className="animate-loader" />
                ) : (
                  t("save")
                )
              ) : (
                t("editProfile")
              )}
            </Button>

            {/* Кнопка отмены редактирования */}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        </form>

        <Button
          variant="outline"
          className="w-full"
          disabled={!user?.phone || passwordChangeRequestMutation.isPending}
          onClick={() => {
            if (!user?.phone) return;
            passwordChangeRequestMutation.mutate({
              phone: user?.phone,
            });
          }}
        >
          {passwordChangeRequestMutation.isPending ? (
            <Loader className="animate-loader" />
          ) : (
            t("changePassword")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
