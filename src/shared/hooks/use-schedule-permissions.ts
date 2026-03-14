"use client";

import { useMemo } from "react";
import type {
  ScheduleScope,
  ScheduleType,
  ScheduleUserFlags,
  PointScheduleContext,
} from "@/src/shared/types/schedule";

export interface UseSchedulePermissionsArgs {
  /** Текущий пользователь: опциональные флаги can_work, can_manage_point_schedule. */
  userFlags?: ScheduleUserFlags | null;
  /** Контекст точки: schedule_type (fixed | mixed). */
  pointContext?: PointScheduleContext | null;
}

export interface UseSchedulePermissionsResult {
  /** Можно ли редактировать график точки. */
  canEditPointSchedule: boolean;
  /** Можно ли редактировать свой (мастерский) график. */
  canEditOwnSchedule: boolean;
  /** Фиксированный график точки: мастер видит график точки и не может его менять (если нет can_manage_point_schedule). */
  isPointScheduleFixed: boolean;
  /** Доступные режимы: point и/или staff. */
  scopeOptions: ScheduleScope[];
  /** Режим по умолчанию при наличии обоих. */
  defaultScope: ScheduleScope;
}

/**
 * Определяет права на редактирование графика по типу точки и флагам пользователя.
 * can_manage_point_schedule + can_work → может менять и точку, и своё расписание (при mixed).
 * can_manage_point_schedule без can_work → только график точки.
 * can_work при mixed → только свой график.
 */
export function useSchedulePermissions({
  userFlags,
  pointContext,
}: UseSchedulePermissionsArgs): UseSchedulePermissionsResult {
  return useMemo(() => {
    const scheduleType: ScheduleType = pointContext?.schedule_type ?? "mixed";
    const canWork = userFlags?.can_work ?? false;
    const canManagePoint = userFlags?.can_manage_point_schedule ?? false;

    const isPointScheduleFixed = scheduleType === "fixed";
    // Менять график точки может только тот, у кого есть право can_manage_point_schedule.
    const canEditPointSchedule = canManagePoint;
    // Свой график мастер правит только при mixed и наличии can_work.
    const canEditOwnSchedule = canWork && scheduleType === "mixed";

    const scopeOptions: ScheduleScope[] = [];
    if (canEditPointSchedule) scopeOptions.push("point");
    if (canEditOwnSchedule) scopeOptions.push("staff");

    const defaultScope: ScheduleScope = scopeOptions.includes("staff")
      ? "staff"
      : "point";

    return {
      canEditPointSchedule,
      canEditOwnSchedule,
      isPointScheduleFixed: isPointScheduleFixed && !canManagePoint,
      scopeOptions,
      defaultScope,
    };
  }, [
    userFlags?.can_work,
    userFlags?.can_manage_point_schedule,
    pointContext?.schedule_type,
  ]);
}
