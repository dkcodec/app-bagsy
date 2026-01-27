import { ConditionalSidebarLayout } from "@/src/widgets/navigation/conditional-sidebar-layout";
import type { ReactNode } from "react";


export default async function SidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>;
}
