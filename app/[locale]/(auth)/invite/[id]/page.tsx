import { InviteForm } from "@/src/features/auth";
import { getIsMobile } from "@/src/shared/hooks/use-mobile-server";
import LoginBackground from "@/src/widgets/backgrounds";
import { notFound } from "next/navigation";
import { AuthService } from "@/src/shared/services/auth-service";

/**
 * Страница приглашения сотрудника
 * Токен передается в URL как динамический сегмент [id]
 * Пример: ru/invite/xit1ettpbs
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id: token } = await params;
  const isMobile = await getIsMobile();

  // Проверяем валидность токена через API
  let tokenData;
  try {
    tokenData = await AuthService.verifyAuthToken(token);
  } catch {
    // Если токен невалиден (401) или произошла ошибка - показываем not-found
    notFound();
  }

  return (
    <div className="flex min-h-svh bg-linear-to-br from-accent-100 via-white to-accent-100 dark:from-accent-950 dark:via-background dark:to-accent-950 flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <LoginBackground isMobile={isMobile} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full max-w-md">
          <InviteForm
            token={token}
            phone={tokenData.phone}
            purpose={tokenData.purpose}
          />
        </div>
      </div>
    </div>
  );
}
