"use client";

import { useCurrentUser } from "@/src/shared/hooks";
import { ProfileHeader } from "@/src/features/profile/profile-header";
import { ProfileDisplay } from "@/src/features/profile/profile-display";
import { ProfileForm } from "@/src/features/profile/profile-form";
import { Alert, AlertDescription } from "@/src/entities";

/**
 * Страница профиля пользователя
 * Отображает информацию о пользователе и позволяет её редактировать
 */
export default function ProfilePage() {
  const { data: userResponse, isLoading, error } = useCurrentUser();

  // Извлекаем данные пользователя из ответа
  const user = userResponse?.data;

  // Состояние загрузки - показываем карточки с частичными скелетонами
  if (isLoading) {
    return (
      <>
        {/* Заголовок страницы */}
        <ProfileHeader />

        {/* Основной контент с частичными скелетонами */}
        <div className="grid gap-6 md:grid-cols-2 px-4 w-full">
          {/* Отображение информации о профиле с скелетонами */}
          <ProfileDisplay isLoading={true} />

          {/* Форма редактирования профиля с скелетонами */}
          <ProfileForm isLoading={true} />
        </div>
      </>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <div className="container mx-auto">
        <ProfileHeader />
        <Alert variant="destructive">
          <AlertDescription>
            Произошла ошибка при загрузке профиля. Попробуйте обновить страницу.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Если пользователь не найден
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertDescription>
            Пользователь не найден. Проверьте правильность входа в систему.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* Заголовок страницы */}
      <ProfileHeader user={user} />

      {/* Основной контент */}
      <div className="grid gap-6 md:grid-cols-2 px-4 w-full">
        {/* Отображение информации о профиле */}
        <ProfileDisplay user={user} isLoading={false} />

        {/* Форма редактирования профиля */}
        <ProfileForm user={user} isLoading={false} />
      </div>
    </>
  );
}
