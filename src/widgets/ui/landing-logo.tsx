"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Логотип для Landing page
 * Не зависит от sidebar контекста
 */
export function LandingLogo({
  width = 120,
  height = 40,
  alt = "Bagsy Logo",
  className = "",
}: {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Image
        src="/logo-full-light.svg"
        alt={alt}
        width={width}
        height={height}
        priority
        className={className}
      />
    );
  }

  const logoSrc =
    resolvedTheme === "dark" ? "/logo-full-dark.svg" : "/logo-full-light.svg";

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
