"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LoginBackgroundProps {
  isMobile: boolean;
}

export default function LoginBackground({ isMobile }: LoginBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getLogoPath = () => {
    if (isMobile) {
      return resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg";
    }
    return resolvedTheme === "dark"
      ? "/logo-full-dark.svg"
      : "/logo-full-light.svg";
  };

  return (
    <div
      className="absolute inset-0 opacity-10 dark:opacity-5"
      style={{
        backgroundImage: `url(${getLogoPath()})`,
        backgroundSize: isMobile ? "300px 300px" : "900px 700px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
