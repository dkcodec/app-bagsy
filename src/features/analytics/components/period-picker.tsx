"use client";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from "@/src/entities";
import { useIsMobile } from "@/src/shared/hooks/use-mobile";
import { cn } from "@/src/shared/utils/styles";
import { PERIOD_PRESETS, type TPeriodPreset } from "../constants";
import {
  getPresetRange,
  inferPreset,
  ymdFromDate,
  type IAnalyticsPeriod,
} from "../utils/period";

interface PeriodPickerProps {
  period: IAnalyticsPeriod;
  onChange: (next: IAnalyticsPeriod) => void;
}

/** Форматирование "YYYY-MM-DD" → "DD.MM.YYYY". */
const fmtYmd = (s: string) => {
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
};

/**
 * Селектор периода: пресеты (кнопки) + кастомный DateRangePicker в popover.
 *
 * UX:
 *  - При открытии popover в календаре уже подсвечен текущий период (draft).
 *  - Любой клик меняет draft (одна или две даты), но НЕ применяется наверх.
 *  - Применение — только по кнопке «Применить» (disabled до полного range).
 *  - Закрытие без сохранения — клик вне popover или «Отмена».
 */
export function PeriodPicker({ period, onChange }: PeriodPickerProps) {
  const t = useTranslations("Analytics.period");
  const currentPreset = inferPreset(period);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Локальный draft. При открытии заполняем текущим периодом — пользователь
  // видит, что уже выбрано, и может перевыбрать. С кнопкой «Применить»
  // popover не закрывается сам, даже если первый клик расширяет range.
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setDraft({
        from: new Date(period.from + "T00:00:00"),
        to: new Date(period.to + "T00:00:00"),
      });
    }
  }, [open, period.from, period.to]);

  // При выборе пресета — пересчитываем границы и пробрасываем наверх
  const applyPreset = (preset: TPeriodPreset) => {
    if (preset === "custom") {
      setOpen(true);
      return;
    }
    onChange(getPresetRange(preset));
  };

  // Применить выбранный в draft диапазон
  const handleApply = () => {
    if (!draft?.from || !draft?.to) return;
    onChange({
      from: ymdFromDate(draft.from),
      to: ymdFromDate(draft.to),
    });
    setOpen(false);
  };

  const labelForCustom = () => `${fmtYmd(period.from)} — ${fmtYmd(period.to)}`;

  return (
    // flex-nowrap + shrink-0 на кнопках — чтобы они оставались в одной линии
    // и работал горизонтальный скролл родителя (overflow-x-auto в analytics-header).
    // Сам picker — горизонтальный скролл-контейнер, scrollbar скрыт утилитой
    // no-scrollbar (см. shadcn.css). pe-3 даёт зазор последней кнопке от
    // правого края — padding-inline-end на flex-overflow контейнере НЕ
    // схлопывается так же охотно, как pr на чистом overflow-родителе.
    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar">
      {PERIOD_PRESETS.filter(p => p !== "custom").map(preset => (
        <Button
          key={preset}
          variant={currentPreset === preset ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(preset)}
          className="shrink-0 motion-safe:transition-colors"
        >
          {t(preset)}
        </Button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={currentPreset === "custom" ? "default" : "outline"}
            size="sm"
            className={cn("shrink-0 gap-1.5")}
          >
            <CalendarIcon className="size-3.5" />
            {currentPreset === "custom" ? labelForCustom() : t("custom")}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          // На мобиле прижимаем к левому краю триггера, на десктопе — к правому.
          // collisionPadding не даёт popover уехать за edge экрана.
          align={isMobile ? "start" : "end"}
          collisionPadding={8}
          sideOffset={8}
        >
          <Calendar
            mode="range"
            // На мобиле — 1 месяц (2 не помещаются), на десктопе — 2 рядом
            numberOfMonths={isMobile ? 1 : 2}
            defaultMonth={new Date(period.from + "T00:00:00")}
            selected={draft}
            onSelect={setDraft}
            // Запрет выбора будущих дат — нечего там анализировать
            disabled={{ after: new Date() }}
          />

          {/* Футер: кнопки действий */}
          <Separator />
          <div className="flex items-center justify-end gap-2 p-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!draft?.from || !draft?.to}
            >
              {t("apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
