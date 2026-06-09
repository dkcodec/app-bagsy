import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/entities/sidebar";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function NavMain({
  main,
}: {
  main: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const t = useTranslations("Sidebar.Main");
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // Определяем активную страницу по pathname
  // Убираем locale prefix (/ru, /kz) для сравнения
  const cleanPath = pathname.replace(/^\/(ru|kz)/, "") || "/";

  const isItemActive = (url: string) =>
    url === "/" ? cleanPath === "/" : cleanPath.startsWith(url);

  // Закрыть мобильный сайдбар при выборе пункта меню
  const handleClick = () => setOpenMobile(false);

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {main.map(item => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isItemActive(item.url)}>
                <Link href={item.url} prefetch onClick={handleClick}>
                  <item.icon />
                  <span>{t(item.name)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Collapsed: icon-only with tooltips */}
      <SidebarGroup className="hidden group-data-[collapsible=icon]:block">
        <SidebarMenu>
          {main.map(item => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isItemActive(item.url)}
                tooltip={t(item.name)}
              >
                <Link
                  href={item.url}
                  prefetch
                  aria-label={t(item.name)}
                  onClick={handleClick}
                >
                  <item.icon />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
