import { SettingsContent } from "@/src/features/settings";
import { SettingsHeader } from "@/src/features/settings/settings-header";
import { Loader } from "lucide-react";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <>
      <SettingsHeader />

      <Suspense fallback={<Loader className="h-6 w-6 animate-spin" />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}
