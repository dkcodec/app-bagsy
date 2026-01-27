"use server";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/src/entities/sidebar";
import { cookies } from "next/headers";

interface ConditionalSidebarLayoutProps {
  children: React.ReactNode;
}

export async function ConditionalSidebarLayout({
  children,
}: ConditionalSidebarLayoutProps) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
