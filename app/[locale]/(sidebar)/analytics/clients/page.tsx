import { Suspense } from "react";
import { Loader } from "lucide-react";
import { AnalyticsClients, AnalyticsGuard } from "@/src/features/analytics";

/** /analytics/clients — раздел "Клиенты" (Beta). Manager/Owner. */
export default function AnalyticsClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AnalyticsGuard requires="clients">
        <AnalyticsClients />
      </AnalyticsGuard>
    </Suspense>
  );
}
