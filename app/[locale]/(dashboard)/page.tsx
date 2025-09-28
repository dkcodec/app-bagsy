import { Suspense } from "react";
import { DashboardHeader, DashboardContent } from "@/src/features";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <Suspense fallback={<div className="p-4" />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
