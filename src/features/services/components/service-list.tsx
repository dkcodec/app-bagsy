"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Skeleton } from "@/src/entities/skeleton";
import type { IServiceDto } from "@/src/shared/services/service-service";
import type { IServiceCategory } from "@/src/shared/services/service-service";
import { useCreateService } from "@/src/shared/hooks/use-services";
import type { ServiceStaffMember } from "@/src/shared/hooks/user-staff";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { EUserRole } from "@/src/shared/types/user";
import { ServiceRow } from "./service-row";
import { ServiceDrawer, type DrawerTab } from "./service-drawer";
import { DeleteServiceDialog } from "./delete-service-dialog";

interface ServiceListProps {
  services: IServiceDto[];
  categories: IServiceCategory[];
  locationId: string;
  isLoading: boolean;
  staffMap: Map<string, ServiceStaffMember[]>;
}

/**
 * Список услуг с группировкой по категориям
 */
export function ServiceList({
  services,
  categories,
  locationId,
  isLoading,
  staffMap,
}: ServiceListProps) {
  const t = useTranslations("Services");
  const createService = useCreateService();
  const { data: currentUser } = useCurrentUser();
  const isStaff = currentUser?.role === EUserRole.STAFF;

  // Drawer state
  const [drawerService, setDrawerService] = useState<IServiceDto | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("details");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Delete dialog state
  const [deleteService, setDeleteService] = useState<IServiceDto | null>(null);

  // Карта id→name для категорий (плоская, включая children)
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (cats: IServiceCategory[]) => {
      for (const c of cats) {
        map.set(c.id, c.name);
        if (c.children?.length) walk(c.children);
      }
    };
    walk(categories);
    return map;
  }, [categories]);

  // Группировка услуг по category_id
  const grouped = useMemo(() => {
    const map = new Map<string, IServiceDto[]>();
    for (const s of services) {
      const key = s.category_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [services]);

  // Открыть drawer
  const openDrawer = (service: IServiceDto, tab: DrawerTab) => {
    setDrawerService(service);
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  // Дублировать услугу
  const handleDuplicate = async (service: IServiceDto) => {
    try {
      await createService.mutateAsync({
        name: `${service.name} (copy)`,
        description: service.description || "",
        location_id: service.location_id || locationId,
        category_id: service.category_id,
        subcategory_id: service.subcategory_id,
        duration_minutes: service.duration_minutes,
        color: service.color,
      });
      toast.success(t("actions.duplicateSuccess"));
    } catch {
      toast.error(t("actions.duplicateError"));
    }
  };

  // Скелетон загрузки
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-b last:border-b-0">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Пустое состояние
  if (services.length === 0 && !isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        {/* Заголовки колонок (staff — без мастеров и действий) */}
        <div
          className={`hidden md:grid gap-3 items-center px-4 py-2 border-b bg-muted/30 ${isStaff ? "md:grid-cols-[6px_1fr_90px_110px]" : "md:grid-cols-[6px_1fr_90px_110px_100px_32px]"}`}
        >
          <span />
          <span className="text-xs text-muted-foreground">
            {t("table.name")}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("table.duration")}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("table.price")}
          </span>
          {!isStaff && (
            <>
              <span className="text-xs text-muted-foreground">
                {t("table.masters")}
              </span>
              <span />
            </>
          )}
        </div>

        {/* Группы по категориям */}
        {Array.from(grouped.entries()).map(([catId, items]) => (
          <div key={catId}>
            {/* Заголовок категории */}
            <div className="flex justify-between items-center px-4 py-2 bg-muted/50 border-b text-xs">
              <span className="font-medium text-muted-foreground">
                {categoryMap.get(catId) || catId}
              </span>
              <span className="text-muted-foreground">{items.length}</span>
            </div>

            {/* Строки услуг */}
            {items.map(service => (
              <ServiceRow
                key={service.id}
                service={service}
                staff={staffMap.get(service.id) || []}
                isStaff={isStaff}
                onRowClick={() => openDrawer(service, "details")}
                onAssignClick={() => openDrawer(service, "staff")}
                onEdit={() => openDrawer(service, "details")}
                onManageStaff={() => openDrawer(service, "staff")}
                onDuplicate={() => handleDuplicate(service)}
                onDelete={() => setDeleteService(service)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Drawer */}
      <ServiceDrawer
        service={drawerService}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        defaultTab={drawerTab}
        locationId={locationId}
        staffMap={staffMap}
      />

      {/* Delete dialog */}
      {deleteService && (
        <DeleteServiceDialog
          service={deleteService}
          open={!!deleteService}
          onOpenChange={open => !open && setDeleteService(null)}
        />
      )}
    </>
  );
}
