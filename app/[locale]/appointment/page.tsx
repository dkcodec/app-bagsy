import { getTranslations } from "next-intl/server";
import AppointmentForm from "@/src/all-pages/appointment-form";

export default async function Appointment({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="flex min-h-svh bg-gradient-to-br from-accent-100 via-white to-accent-100 dark:from-accent-950 dark:via-background dark:to-accent-950 flex-col p-6 md:p-10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <AppointmentForm />
    </div>
  );
}
