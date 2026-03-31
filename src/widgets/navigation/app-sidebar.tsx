"use client";
import {
  Calendar,
  ChartSpline,
  ClipboardList,
  Contact,
  Users,
  BriefcaseBusiness,
  Clock,
} from "lucide-react";

import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/src/entities/sidebar";
import { ThemeLogo } from "../ui/theme-logo";
import { PwaInstallPrompt } from "../ui/pwa-install-prompt";
import { NavMain } from "./nav-main";
import Link from "next/link";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import type { TUserRole } from "@/src/shared/types/user";
import { EUserRole } from "@/src/shared/types/user";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

type NavItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  allowedRoles?: TUserRole[];
};

const navData: { navMain: NavItem[] } = {
  navMain: [
    {
      name: "calendar",
      url: "/",
      icon: Calendar,
      isActive: true,
    },
    {
      name: "schedule",
      url: "/schedule",
      icon: Clock,
    },
    // {
    //   name: "clients",
    //   url: "/clients",
    //   icon: Contact,
    // },
    {
      name: "services",
      url: "/services",
      icon: ClipboardList,
    },
    {
      name: "staff",
      url: "/staff",
      icon: Users,
      allowedRoles: [EUserRole.OWNER, EUserRole.MANAGER],
    },
    {
      name: "locations",
      url: "/locations",
      icon: BriefcaseBusiness,
      allowedRoles: [EUserRole.OWNER, EUserRole.MANAGER],
    },
    // {
    //   name: "analytics",
    //   url: "/analytics",
    //   icon: ChartSpline,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useCurrentUser();

  // Фильтрация навигации по ролям пользователя
  const filteredNav = useMemo(() => {
    if (!userData?.role) return navData.navMain;

    return navData.navMain
      .filter(item => {
        // Если allowedRoles не указано, пункт доступен всем
        if (!item.allowedRoles) return true;
        // Проверяем, есть ли роль пользователя в списке разрешенных
        return item.allowedRoles.includes(userData.role);
      })
      .map(({ allowedRoles, ...item }) => item); // Удаляем allowedRoles перед передачей в NavMain
  }, [userData?.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-2">
        <Link href="/">
          <ThemeLogo alt="Logo" />{" "}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain main={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <PwaInstallPrompt />
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
