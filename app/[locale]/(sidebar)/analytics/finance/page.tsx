import { Suspense } from "react";
import { Loader } from "lucide-react";
import { AnalyticsFinance, AnalyticsGuard } from "@/src/features/analytics";

/** /analytics/finance — финансовый отчёт. Manager/Owner. */
export default function AnalyticsFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="finance">
        <AnalyticsFinance />
      </AnalyticsGuard>
    </Suspense>
  );
}
