"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/entities/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../forms/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/entities/sidebar";
import { useLogout } from "@/src/shared/hooks/use-auth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { IUserDto } from "@/src/shared/types/user";

export function NavUser({ user }: { user?: IUserDto }) {
  const { isMobile } = useSidebar();
  const t = useTranslations("Sidebar.User");

  const logout = useLogout();
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user?.avatar_url ? (
                  <AvatarImage src={user?.avatar_url} alt={user?.name ?? "avatar"} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {`${user?.name?.[0].toUpperCase()}${user?.surname?.[0].toUpperCase()}`}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.phone}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {user?.avatar_url ? (
                    <AvatarImage src={user?.avatar_url} alt={user?.name ?? "avatar"} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {`${user?.name?.[0].toUpperCase()}${user?.surname?.[0].toUpperCase()}`}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.phone}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles />
                {t("updateToPro")}
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => logout.mutate()}
            >
              <LogOut />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
