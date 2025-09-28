"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/src/entities/sidebar";

interface ConditionalSidebarLayoutProps {
  children: React.ReactNode;
}

export function ConditionalSidebarLayout({
  children,
}: ConditionalSidebarLayoutProps) {
  const pathname = usePathname();

  // Определяем пути, где НЕ нужно показывать сайдбар
  const excludePaths = ["/login", "/invite"];

  // Проверяем, содержит ли текущий путь один из исключенных путей
  const shouldShowSidebar = !excludePaths.some(path => pathname.includes(path));

  // Если сайдбар не нужен, просто возвращаем children
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Если сайдбар нужен, оборачиваем в SidebarProvider
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
