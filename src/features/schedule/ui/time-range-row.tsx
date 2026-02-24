"use client";

import type { TimeValue } from "react-aria-components";
import { TimeInput } from "@/src/entities/time-input";
import { Label } from "@/src/entities/label";
import { Button } from "@/src/entities";
import { parseScheduleTime } from "@/src/shared/utils/formater";
import { X } from "lucide-react";
import type { TimeRange } from "@/src/shared/types/schedule";

export interface TimeRangeRowProps {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  onRemove?: () => void;
  labelFrom?: string;
  labelTo?: string;
  disabled?: boolean;
}

function timeToValue(s: string): TimeValue {
  const { hour, minute } = parseScheduleTime(s || "00:00");
  return { hour, minute } as TimeValue;
}

function valueToTime(v: TimeValue): string {
  return `${String(v.hour).padStart(2, "0")}:${String(v.minute ?? 0).padStart(2, "0")}`;
}

export function TimeRangeRow({
  value,
  onChange,
  onRemove,
  labelFrom = "С",
  labelTo = "До",
  disabled,
}: TimeRangeRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
        <Label className="text-sm whitespace-nowrap">{labelFrom}</Label>
        <TimeInput
          hourCycle={24}
          granularity="minute"
          value={timeToValue(value.start)}
          onChange={v => v && onChange({ ...value, start: valueToTime(v) })}
          className="flex-1"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-[100px]">
        <Label className="text-sm whitespace-nowrap">{labelTo}</Label>
        <TimeInput
          hourCycle={24}
          granularity="minute"
          value={timeToValue(value.end)}
          onChange={v => v && onChange({ ...value, end: valueToTime(v) })}
          className="flex-1"
          disabled={disabled}
        />
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Удалить"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
