"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from "@/src/entities";
import { useUpdateProfile } from "@/src/shared/hooks";
import { UserDto } from "@/src/shared/services/user-service";

interface ProfileFormProps {
  user?: UserDto;
  isLoading?: boolean;
  onSuccess?: () => void;
}

/**
 * Форма редактирования профиля пользователя
 * Использует react-hook-form с zod валидацией
 */
export function ProfileForm({ user, isLoading, onSuccess }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProfile = useUpdateProfile();
  const t = useTranslations("Profile.ProfileForm");

  // Схема валидации для формы профиля
  const profileSchema = z
    .object({
      name: z.string().min(2, t("nameMinError")),
      surname: z.string().min(2, t("surnameMinError")),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .refine(
      data => {
        // Если указан пароль, то confirmPassword тоже должен быть указан
        if (data.password && !data.confirmPassword) {
          return false;
        }
        // Если указан confirmPassword, то password тоже должен быть указан
        if (data.confirmPassword && !data.password) {
          return false;
        }
        // Если оба поля заполнены, они должны совпадать
        if (data.password && data.confirmPassword) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: t("passwordMismatchError"),
        path: ["confirmPassword"],
      }
    );

  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      surname: user?.surname || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Подготавливаем данные для отправки - убираем пустые поля пароля
      const updateData: { name: string; surname: string; password?: string } = {
        name: data.name,
        surname: data.surname,
      };

      // Добавляем пароль только если он указан
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      await updateProfile.mutateAsync(updateData);
      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const tInfo = useTranslations("Profile.ProfileInfo");

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tInfo("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 h-[300px]">
          <div className="flex justify-between flex-col h-full">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {tInfo("name")}
                  </Label>
                  <div className="text-sm">
                    {isLoading ? <Skeleton className="h-4 w-20" /> : user?.name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {tInfo("surname")}
                  </Label>
                  <div className="text-sm">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      user?.surname
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {tInfo("role")}
                </Label>
                <div className="text-sm">
                  {isLoading ? <Skeleton className="h-4 w-16" /> : user?.role}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full"
              disabled={isLoading}
            >
              {tInfo("editProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("namePlaceholder")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">{t("surname")}</Label>
              <Input
                id="surname"
                {...register("surname")}
                placeholder={t("surnamePlaceholder")}
                disabled={isSubmitting}
              />
              {errors.surname && (
                <p className="text-sm text-destructive">
                  {errors.surname.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={t("passwordPlaceholder")}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder={t("confirmPasswordPlaceholder")}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? t("saving") : t("save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
