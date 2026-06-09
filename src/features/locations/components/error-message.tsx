import { useTranslations } from "next-intl";

/**
 * Компонент отображения ошибки загрузки данных
 */
interface ErrorMessageProps {
  error: unknown;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  const t = useTranslations("Locations");

  return (
    <div className="text-center text-destructive py-8">
      {error instanceof Error && "status" in error && error.status === 403 ? (
        <div>
          <p className="font-semibold mb-2">{t("accessDenied")}</p>
          <p className="text-sm text-muted-foreground">
            {t("accessDeniedDescription")}
          </p>
        </div>
      ) : (
        <p>
          {t("errorLoading")}:{" "}
          {error instanceof Error ? error.message : t("errorLoading")}
        </p>
      )}
    </div>
  );
}
