"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/entities/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/entities/tabs";
import type { IServiceDto } from "@/src/shared/services/service-service";
import type { ServiceStaffMember } from "@/src/shared/hooks/user-staff";
import { ServiceDetailsTab } from "./service-details-tab";
import { ServiceStaffTab } from "./service-staff-tab";

export type DrawerTab = "details" | "staff";

interface ServiceDrawerProps {
  service: IServiceDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: DrawerTab;
  locationId: string;
  staffMap: Map<string, ServiceStaffMember[]>;
}

/**
 * Боковой drawer услуги — Sheet с табами Details / Staff
 */
export function ServiceDrawer({
  service,
  open,
  onOpenChange,
  defaultTab,
  locationId,
  staffMap,
}: ServiceDrawerProps) {
  const t = useTranslations("Services.drawer");

  if (!service) return null;

  const handleClose = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 sm:max-w-md p-0 flex flex-col"
      >
        {/* Заголовок */}
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: service.color }}
            />
            <SheetTitle className="text-base">{service.name}</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            {service.description || ""}
          </SheetDescription>
        </SheetHeader>

        {/* Табы — key сбрасывает при смене услуги или таба */}
        <Tabs
          key={`${service.id}-${defaultTab}`}
          defaultValue={defaultTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="details"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 text-sm"
            >
              {t("detailsTab")}
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 text-sm"
            >
              {t("staffTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto mt-0">
            <ServiceDetailsTab service={service} onClose={handleClose} />
          </TabsContent>

          <TabsContent value="staff" className="flex-1 overflow-y-auto mt-0">
            <ServiceStaffTab
              service={service}
              locationId={locationId}
              assignedStaff={staffMap.get(service.id) || []}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
