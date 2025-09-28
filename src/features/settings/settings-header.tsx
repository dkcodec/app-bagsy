import React from "react";
import { SidebarTrigger } from "@/src/entities/sidebar";
import { Separator } from "@/src/entities/separator";
import { HeaderTitle } from "@/src/entities/header-title";

export const SettingsHeader: React.FC = () => {
  return (
    <header className="flex h-16 shrink-0 items-center bg-background gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 left-0 right-0 z-10 md:relative">
      <div className="flex items-center gap-2 px-4 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <HeaderTitle title="settings" welcome={false} />
      </div>
    </header>
  );
};

export default SettingsHeader;
