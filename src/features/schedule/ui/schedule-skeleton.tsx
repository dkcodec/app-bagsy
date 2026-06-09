"use client";

import { Skeleton } from "@/src/entities";
import { Card, CardContent } from "@/src/entities";

/** Скелетон календарной сетки 7x5. */
export function ScheduleCalendarSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4">
        {/* Заголовки дней недели */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-6 mx-auto rounded" />
          ))}
        </div>
        {/* 5 рядов по 7 ячеек */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton
              key={i}
              className="min-h-[40px] md:min-h-[64px] rounded-lg"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Скелетон панели редактора. */
export function ScheduleEditorSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-5 w-48 rounded" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-20 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded" />
            <Skeleton className="h-9 flex-1 rounded" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded" />
            <Skeleton className="h-9 flex-1 rounded" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
