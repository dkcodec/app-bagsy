import { Suspense } from "react";
import { AppSidebar } from "@/src/widgets/navigation";
import { SidebarInset, SidebarProvider } from "@/src/entities/sidebar";
import { DashboardHeader, DashboardContent } from "@/src/features";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <DashboardHeader />

        <Suspense fallback={<div className="p-4" />}>
          <DashboardContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
