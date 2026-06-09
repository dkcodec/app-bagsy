"use client";
import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/entities";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * Heatmap "мастер × день недели" — кто когда загружен.
 */
export function StaffLoadHeatmap({
  rows,
  load,
}: {
  rows: Array<{ id: string; name: string }>;
  load: Array<{ employee_id: string; weekday: number; value: number }>;
}) {
  const t = useTranslations("Analytics");
  const tDays = useTranslations("Dashboard.Settings");

  // Карта (emp_id × weekday → value)
  const byKey = useMemo(() => {
    const m = new Map<string, number>();
    load.forEach(l => m.set(`${l.employee_id}-${l.weekday}`, l.value));
    return m;
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-4 text-accent" />
          {t("staff.weekdayLoad")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "auto repeat(7, minmax(0, 1fr))" }}
        >
          <div />
          {WEEKDAY_KEYS.map(k => (
            <div
              key={k}
              className="text-[10px] text-muted-foreground text-center"
            >
              {tDays(k)}
            </div>
          ))}

          {rows.map(emp => (
            <FragmentRow
              key={emp.id}
              name={emp.name}
              empId={emp.id}
              byKey={byKey}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FragmentRow({
  name,
  empId,
  byKey,
}: {
  name: string;
  empId: string;
  byKey: Map<string, number>;
}) {
  return (
    <>
      <div className="text-xs text-muted-foreground pr-2 self-center truncate">
        {name}
      </div>
      {Array.from({ length: 7 }).map((_, w) => {
        const v = byKey.get(`${empId}-${w}`) ?? 0;
        const opacity = 0.08 + v * 0.85;
        return (
          <div
            key={w}
            className="h-6 rounded-sm motion-safe:animate-in motion-safe:fade-in"
            style={{
              backgroundColor: `hsl(var(--accent) / ${opacity})`,
              animationDelay: `${w * 30}ms`,
              animationDuration: "400ms",
              animationFillMode: "both",
            }}
            title={`${Math.round(v * 100)}%`}
          />
        );
      })}
    </>
  );
}
