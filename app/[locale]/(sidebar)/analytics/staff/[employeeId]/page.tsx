import { Suspense } from "react";
import { Loader } from "lucide-react";
import { AnalyticsGuard, EmployeeDetail } from "@/src/features/analytics";

/**
 * /analytics/staff/[employeeId] — drill-down по мастеру.
 * Доступ как у /analytics/staff (Manager/Owner).
 */
export default async function EmployeeAnalyticsPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="staff">
        <EmployeeDetail employeeId={employeeId} />
      </AnalyticsGuard>
    </Suspense>
  );
}
