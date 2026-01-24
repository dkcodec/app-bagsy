import { ServicesHeader, ServicesContent } from "@/src/features/services";

/**
 * Страница услуг
 * Доступна только для ролей MANAGER и выше
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHeader />
      <ServicesContent />
    </>
  );
}
