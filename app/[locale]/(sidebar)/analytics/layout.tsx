"use client";
import { usePathname } from "next/navigation";
import { AnalyticsHeader } from "@/src/features/analytics";

/**
 * Layout раздела аналитики.
 * - Рендерит общую шапку (title + табы + period picker).
 * - Каждый подэкран при смене pathname получает свежий ключ → плавный re-mount
 *   через tailwindcss-animate (fade + slide). prefers-reduced-motion → мгновенно.
 */
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      <AnalyticsHeader />
      <div
        key={pathname}
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
      >
        {children}
      </div>
    </>
  );
}
