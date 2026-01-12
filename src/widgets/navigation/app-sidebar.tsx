"use client";
import * as React from "react";
import {
  Calendar,
  ChartSpline,
  ClipboardList,
  Contact,
  Settings,
  Users,
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
import { NavMain } from "./nav-main";
import Link from "next/link";
import { useCurrentUser } from "@/src/shared/hooks/use-users";
import { useTranslations } from "next-intl";

const navData = {
  navMain: [
    {
      name: "calendar",
      url: "/",
      icon: Calendar,
      isActive: true,
    },
    {
      name: "clients",
      url: "/clients",
      icon: Contact,
    },
    {
      name: "services",
      url: "/services",
      icon: ClipboardList,
    },
    {
      name: "staff",
      url: "/staff",
      icon: Users,
    },
    {
      name: "analytics",
      url: "/analytics",
      icon: ChartSpline,
    },
    {
      name: "settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar");

  const { data: userData } = useCurrentUser();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-2">
        <Link href="/">
          <ThemeLogo alt="Logo" />{" "}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain main={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: userData?.name ?? t("User.name"),
            phone: userData?.phone ?? t("User.phone"),
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
