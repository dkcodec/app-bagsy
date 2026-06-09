"use client";
import React from "react";
import { cn } from "@/src/shared/utils/styles";

/**
 * Контейнер с каскадным появлением детей.
 * Проставляет CSS-переменную `--i` для каждого ребёнка → используется
 * утилитой animate-stagger в shadcn.css для расчёта animation-delay.
 *
 * Применение:
 *   <StaggerGrid className="grid gap-4 md:grid-cols-4">
 *     <KpiCard ... />
 *     <KpiCard ... />
 *   </StaggerGrid>
 */
export function StaggerGrid({
  className,
  children,
  childClassName = "motion-safe:animate-fade-in-up motion-safe:opacity-0",
}: {
  className?: string;
  children: React.ReactNode;
  /** Класс анимации на каждом ребёнке. Сам fadeInUp ставит opacity 0→1. */
  childClassName?: string;
}) {
  const arr = React.Children.toArray(children);
  return (
    <div className={cn("animate-stagger", className)}>
      {arr.map((child, i) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement<{
          className?: string;
          style?: React.CSSProperties;
        }>;
        return React.cloneElement(el, {
          // Пробрасываем --i как CSS-переменную и добавляем анимационный класс.
          // Существующие className/style сохраняются.
          style: { ...(el.props.style || {}), ["--i" as string]: i },
          className: cn(childClassName, el.props.className),
        });
      })}
    </div>
  );
}
