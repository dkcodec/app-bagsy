/**
 * Константы раздела аналитики.
 */

/**
 * Цвета серий графиков через CSS-переменные темы.
 * При смене light↔dark автоматически адаптируются (см. shadcn.css).
 */
export const CHART_COLORS = {
  primary: "hsl(var(--accent))", // оранжевый бренд (35.65 100% 62%)
  primaryMuted: "hsl(var(--accent) / 0.6)",
  compare: "hsl(var(--muted-foreground) / 0.5)", // прошлый период (пунктир)
  success: "hsl(var(--success))",
  warning: "hsl(var(--chart-4))",
  destructive: "hsl(var(--destructive))",
  serie: [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ],
} as const;

/** Стандартные настройки анимации recharts (используются всеми чартами). */
export const CHART_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 800,
  animationEasing: "ease-out",
} as const;

/** Пресеты периода — ключи переводов в `Analytics.period.*`. */
export const PERIOD_PRESETS = [
  "today",
  "week",
  "month",
  "quarter",
  "custom",
] as const;

export type TPeriodPreset = (typeof PERIOD_PRESETS)[number];

/** Названия табов раздела (соответствуют URL после /analytics). */
export type TAnalyticsTab =
  | "overview"
  | "me"
  | "staff"
  | "locations"
  | "finance"
  | "clients";
