"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/entities/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/entities/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/entities/tabs";
import { Avatar, AvatarImage, AvatarFallback, Badge } from "@/src/entities";
import type { IEmployeeDto } from "@/src/shared/types/user";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { getRoleKey } from "../../utils/format-role";
import { ProfileTab } from "./profile-tab";
import { ServicesTab } from "./services-tab";
import { PortfolioTab } from "./portfolio-tab";
import { getInitials } from "@/src/shared/utils/avatar";

interface EmployeeDrawerProps {
  employee: IEmployeeDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Общий tab trigger стиль */
const tabTriggerClass =
  "flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5 text-sm";

/**
 * Боковой drawer сотрудника
 * Мобилка: Vaul bottom-sheet (свайп вниз)
 * Десктоп: Sheet справа
 */
export function EmployeeDrawer({
  employee,
  open,
  onOpenChange,
}: EmployeeDrawerProps) {
  const isMobile = useIsMobile();
  const t = useTranslations("Staff");
  const td = useTranslations("Staff.drawer");

  if (!employee) return null;

  const initials = getInitials(employee.first_name, employee.last_name);

  // Общий контент (header + tabs) — переиспользуется в обоих режимах
  const headerContent = (
    <div className="flex items-center gap-3">
      <Avatar className="size-12">
        {employee.avatar_url && (
          <AvatarImage src={employee.avatar_url} alt={employee.first_name} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-base font-semibold leading-tight">
          {employee.first_name}
        </p>
        <p className="text-base font-medium leading-tight">
          {employee.last_name}
        </p>
        <Badge variant="secondary" className="mt-1 text-xs">
          {t(`roles.${getRoleKey(employee.role)}`)}
        </Badge>
      </div>
    </div>
  );

  const tabsContent = (
    <Tabs
      key={employee.id}
      defaultValue="profile"
      className="flex flex-col flex-1 overflow-hidden"
    >
      <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
        <TabsTrigger value="profile" className={tabTriggerClass}>
          {td("profile")}
        </TabsTrigger>
        <TabsTrigger value="services" className={tabTriggerClass}>
          {td("services")}
        </TabsTrigger>
        <TabsTrigger value="portfolio" className={tabTriggerClass}>
          {td("portfolio")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="flex-1 overflow-y-auto mt-0">
        <ProfileTab employee={employee} />
      </TabsContent>
      <TabsContent value="services" className="flex-1 overflow-y-auto mt-0">
        <ServicesTab employee={employee} />
      </TabsContent>
      <TabsContent value="portfolio" className="flex-1 overflow-y-auto mt-0">
        <PortfolioTab />
      </TabsContent>
    </Tabs>
  );

  // Мобилка — bottom sheet (Vaul)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="sr-only">
              {employee.first_name} {employee.last_name}
            </DrawerTitle>
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
          <SheetTitle className="sr-only">
            {employee.first_name} {employee.last_name}
          </SheetTitle>
          {headerContent}
        </SheetHeader>
        {tabsContent}
      </SheetContent>
    </Sheet>
  );
}
