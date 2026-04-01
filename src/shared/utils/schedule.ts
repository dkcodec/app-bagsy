import type { TimeRange } from "@/src/shared/types/schedule";

/** "HH:mm" → минуты от полуночи. */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Минуты от полуночи → "HH:mm". */
function minutesToTime(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

interface ScheduleSlot {
  type: "work" | "rest";
  start: string;
  end: string;
}

/**
 * Разрезает рабочие интервалы по перерывам.
 * Возвращает плоский массив неперекрывающихся слотов (work + rest).
 *
 * Пример: work 9:00-18:00, break 13:00-15:00
 *   → [work 9:00-13:00, rest 13:00-15:00, work 15:00-18:00]
 */
export function splitWorkByBreaks(
  workRanges: TimeRange[],
  breaks: TimeRange[]
): ScheduleSlot[] {
  if (breaks.length === 0) {
    return workRanges.map(r => ({ type: "work", start: r.start, end: r.end }));
  }

  /* Сортируем перерывы по начальному времени. */
  const sorted = [...breaks].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
  );

  const result: ScheduleSlot[] = [];

  for (const work of workRanges) {
    const wStart = timeToMinutes(work.start);
    const wEnd = timeToMinutes(work.end);
    let cursor = wStart;

    for (const brk of sorted) {
      const bStart = timeToMinutes(brk.start);
      const bEnd = timeToMinutes(brk.end);

      /* Перерыв вне этого рабочего интервала — пропускаем. */
      if (bEnd <= cursor || bStart >= wEnd) continue;

      /* Рабочий кусок до перерыва. */
      if (bStart > cursor) {
        result.push({
          type: "work",
          start: minutesToTime(cursor),
          end: minutesToTime(bStart),
        });
      }

      /* Сам перерыв (обрезаем по границам рабочего интервала). */
      const restStart = Math.max(bStart, cursor);
      const restEnd = Math.min(bEnd, wEnd);
      result.push({
        type: "rest",
        start: minutesToTime(restStart),
        end: minutesToTime(restEnd),
      });

      cursor = restEnd;
    }

    /* Оставшийся рабочий хвост после последнего перерыва. */
    if (cursor < wEnd) {
      result.push({
        type: "work",
        start: minutesToTime(cursor),
        end: minutesToTime(wEnd),
      });
    }
  }

  return result;
}
