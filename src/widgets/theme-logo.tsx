"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSidebar } from "@/src/entities/sidebar"; // читаем состояние сайдбара

/**
 * Компонент логотипа с поддержкой тем
 * Безопасно переключается между светлой и темной версиями без ошибок гидратации
 */
export function ThemeLogo({
  width = 100,
  height = 100,
  alt = "Logo",
}: {
  width?: number;
  height?: number;
  alt?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Image
        src={isCollapsed ? "/logo-light.svg" : "/logo-full-light.svg"}
        alt={alt}
        width={width}
        height={height}
        priority
        className="pl-2"
      />
    );
  }

  const logoSrc = (() => {
    const isDark = resolvedTheme === "dark";
    if (isCollapsed) {
      width = 30;
      height = 30;
      return isDark ? "/logo-dark.svg" : "/logo-light.svg";
    }
    return isDark ? "/logo-full-dark.svg" : "/logo-full-light.svg";
  })();

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      priority
      className="pl-2"
    />
  );
}
