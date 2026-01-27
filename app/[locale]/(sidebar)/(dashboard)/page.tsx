import React, { Suspense } from "react";

import { Loader } from "lucide-react";
import { DashboardPage } from "@/src/features/dashboard/dashboard-page";

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
