import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/entities/sidebar";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function NavExtra({
  extra,
}: {
  extra: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const t = useTranslations("Sidebar.Extra");
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {extra.map(item => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{t(item.name)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
