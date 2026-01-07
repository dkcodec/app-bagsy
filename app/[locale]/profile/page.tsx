"use client";

import { useCurrentUser } from "@/src/shared/hooks";
import { ProfileHeader } from "@/src/features/profile/profile-header";
import { ProfileDisplay } from "@/src/features/profile/profile-display";

/**
 * Страница профиля пользователя
 * Отображает информацию о пользователе и позволяет её редактировать
 */
export default function ProfilePage() {
  const { data: userData, isLoading } = useCurrentUser();

  return (
    <>
      <ProfileHeader user={userData} />

      <div className="grid gap-6 lg:grid-cols-1 px-4 w-full">
        {/* Отображение информации о профиле */}
        <ProfileDisplay user={userData} isLoading={isLoading} />
      </div>
    </>
  );
}
