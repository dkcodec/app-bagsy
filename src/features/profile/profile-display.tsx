"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Skeleton,
  Button,
  Input,
} from "@/src/entities";
import { IUserDto } from "@/src/shared/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { usePasswordChangeRequest, useUpdateProfile } from "@/src/shared/hooks";
import { Loader } from "lucide-react";
import { toast } from "sonner";

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
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const passwordChangeRequestMutation = usePasswordChangeRequest();
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
    try {
      // Подготавливаем данные для отправки - убираем пустые поля пароля
      const updateData: { name: string; surname: string } = {
        name: data.name,
        surname: data.surname,
      };

      await updateProfile.mutateAsync(updateData);
      reset();
      setIsEditing(false);
      toast.success(t("profileUpdatedSuccessfully"));
    } catch (error) {
      toast.error(t("errorUpdatingProfile"));
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
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
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold">
                {isLoading ? (
                  <Skeleton className="h-16 w-16 rounded-full" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>
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
                {isLoading ? <Skeleton className="h-4 w-20" /> : user?.role}
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
                  user?.point_code
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
                  user?.network_code
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
                  new Date(user?.created_at || "").toLocaleDateString("ru-RU")
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
                  new Date(user?.updated_at || "").toLocaleDateString("ru-RU")
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
              disabled={isSubmitting}
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
