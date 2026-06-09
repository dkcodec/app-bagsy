"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/entities/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/entities/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/entities/tabs";
import type { IServiceDto } from "@/src/shared/services/service-service";
import type { ServiceStaffMember } from "@/src/shared/hooks/user-staff";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
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

/** Общий tab trigger стиль */
const tabTriggerClass =
  "flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 text-sm";

/**
 * Drawer услуги
 * Мобилка: Vaul bottom-sheet (свайп вниз)
 * Десктоп: Sheet справа
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
  const isMobile = useIsMobile();
  const { data: currentUser } = useCurrentUser();
  const isStaff = currentUser?.role === EUserRole.STAFF;

  if (!service) return null;

  const handleClose = () => onOpenChange(false);

  // Общий заголовок
  const headerContent = (
    <div className="flex items-center gap-2 overflow-hidden">
      <div
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: service.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold leading-tight truncate">
          {service.name}
        </p>
        {service.description && (
          <p className="text-xs text-muted-foreground truncate">
            {service.description}
          </p>
        )}
      </div>
    </div>
  );

  // Staff — только просмотр деталей, без табов
  // Owner/Manager — полные табы с редактированием и привязкой сотрудников
  const tabsContent = isStaff ? (
    <div className="flex-1 overflow-y-auto">
      <ServiceDetailsTab service={service} readOnly />
    </div>
  ) : (
    <Tabs
      key={`${service.id}-${defaultTab}`}
      defaultValue={defaultTab}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
        <TabsTrigger value="details" className={tabTriggerClass}>
          {t("detailsTab")}
        </TabsTrigger>
        <TabsTrigger value="staff" className={tabTriggerClass}>
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
  );

  // Мобилка — bottom sheet (Vaul)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="sr-only">{service.name}</DrawerTitle>
            {headerContent}
          </DrawerHeader>
          {tabsContent}
        </DrawerContent>
      </Drawer>
    );
  }

  // Десктоп — side sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="sr-only">{service.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {service.description || ""}
          </SheetDescription>
          {headerContent}
        </SheetHeader>
        {tabsContent}
      </SheetContent>
    </Sheet>
  );
}
