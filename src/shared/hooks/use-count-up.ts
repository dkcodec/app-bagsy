"use client";
import { useEffect, useState } from "react";

/**
 * Хук для плавной "счётной" анимации числовых KPI.
 * При смене target значение анимируется от старого к новому за durationMs.
 * Уважает prefers-reduced-motion — отключает анимацию и возвращает target сразу.
 */
export function useCountUp(target: number, durationMs: number = 600): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    // Если пользователь не любит анимации — мгновенный рендер
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }

    const start = value;
    const diff = target - start;
    if (diff === 0) return;

    let rafId: number;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      // ease-out cubic — быстро в начале, плавно к концу
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + diff * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // value намеренно не в deps — иначе бесконечный цикл
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
