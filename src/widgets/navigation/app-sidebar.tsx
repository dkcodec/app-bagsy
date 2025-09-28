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

const data = {
  user: {
    name: "Дмитрий Каиргельдин",
    phone: "+77010868788",
    avatar: "/avatars/shadcn.jpg",
  },
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
      name: "employees",
      url: "/employees",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-2">
        <Link href="/">
          <ThemeLogo alt="Logo" />{" "}
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain main={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
