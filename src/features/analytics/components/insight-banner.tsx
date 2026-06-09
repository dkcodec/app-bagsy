"use client";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/src/shared/utils/styles";
import type { IInsight } from "@/src/shared/types/analytics";

/**
 * Плашка инсайта с цветом по уровню.
 * Текст рендерится через children — родительский компонент сам резолвит
 * перевод по insight.key с параметрами.
 */
export function InsightBanner({
  level,
  children,
}: {
  level: IInsight["level"];
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      icon: Lightbulb,
      cls: "bg-accent-50 dark:bg-accent-950/30 text-accent-800 dark:text-accent-200 border-accent-200 dark:border-accent-900",
    },
    warning: {
      icon: AlertTriangle,
      cls: "bg-destructive/5 text-destructive border-destructive/20",
    },
    success: {
      icon: Info,
      cls: "bg-success/5 text-success border-success/20",
    },
  }[level];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 motion-safe:duration-500",
        styles.cls
      )}
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
}
