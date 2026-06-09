"use client";
import * as React from "react";
import * as Recharts from "recharts";
import { cn } from "@/src/shared/utils/styles";

/**
 * Тонкая обёртка над recharts в стиле shadcn:
 *   <ChartContainer config={config}>
 *     <LineChart ...>...<ChartTooltip content={<ChartTooltipContent />} />...</LineChart>
 *   </ChartContainer>
 *
 * Каждый ключ из config мапится в CSS-переменную --color-<key>, благодаря чему
 * чарты автоматически переключаются с light на dark через токены темы.
 */

/** Конфигурация серий: ключ → лейбл + CSS-переменная цвета. */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    /** CSS color значение, например "hsl(var(--chart-1))" */
    color?: string;
  }
>;

// ChartContext чтобы ChartTooltipContent мог достать config без prop drilling
const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  const ctx = React.useContext(ChartContext);
  if (!ctx)
    throw new Error("Chart components must be used inside ChartContainer");
  return ctx;
}

export interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  /** Children — корневой recharts-компонент (LineChart/AreaChart/BarChart/...) */
  children: React.ReactElement;
}

/**
 * Контейнер чарта.
 * - Оборачивает recharts ResponsiveContainer.
 * - Создаёт CSS-переменные `--color-<key>` для всех серий из config.
 * - Применяет shadcn-style оформление текста/осей через :where() селекторы.
 */
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ config, children, className, ...rest }, ref) => {
  // Превращаем config в inline-style с CSS-переменными — recharts серии
  // ссылаются на них через fill/stroke="var(--color-<key>)"
  const styleVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      if (item.color) vars[`--color-${key}`] = item.color;
    }
    return vars as React.CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={config}>
      <div
        ref={ref}
        data-chart=""
        // text/grid стили: используем токены темы вместо хардкода
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        style={styleVars}
        {...rest}
      >
        <Recharts.ResponsiveContainer width="100%" height="100%">
          {children}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

/** Реэкспорт recharts Tooltip — чтобы импорт оставался единый. */
export const ChartTooltip = Recharts.Tooltip;

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    dataKey?: string;
    color?: string;
  }>;
  label?: string | number;
  /** Форматтер значения (например formatTenge) */
  formatter?: (value: number | string, name?: string) => React.ReactNode;
  /** Форматтер заголовка (label) */
  labelFormatter?: (label: string | number) => React.ReactNode;
  /** Скрывать строки с нулевыми значениями */
  hideZero?: boolean;
}

/**
 * Кастомный tooltip с темой shadcn.
 * Не зависит от config — берёт цвета из самого payload (recharts уже подставит var(--color-<key>)).
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  hideZero,
}: ChartTooltipContentProps) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;

  const rows = hideZero ? payload.filter(p => Number(p.value) !== 0) : payload;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md text-popover-foreground min-w-[140px]">
      {label !== undefined && (
        <div className="mb-1 font-medium">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="grid gap-1">
        {rows.map((entry, idx) => {
          const key = entry.dataKey ?? "";
          const meta = config[key];
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2 rounded-[2px]"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">
                  {meta?.label ?? entry.name ?? key}
                </span>
              </div>
              <span className="font-medium tabular-nums">
                {formatter ? formatter(entry.value!, key) : entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
