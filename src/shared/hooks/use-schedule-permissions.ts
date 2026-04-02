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
  /** Solo-план: владелец = единственный сотрудник, табы не нужны. */
  isSoloPlan?: boolean;
}

export interface UseSchedulePermissionsResult {
  /** Можно ли редактировать график точки. */
  canEditPointSchedule: boolean;
  /** Можно ли редактировать свой (мастерский) график. */
  canEditOwnSchedule: boolean;
  /** Фиксированный график точки: мастер видит график точки read-only. */
  isPointScheduleFixed: boolean;
  /** Solo-план: один владелец, табы скрыты. */
  isSoloPlan: boolean;
  /** Доступные режимы: point и/или staff. */
  scopeOptions: ScheduleScope[];
  /** Режим по умолчанию при наличии обоих. */
  defaultScope: ScheduleScope;
}

/**
 * Определяет права на редактирование графика по типу точки и флагам пользователя.
 *
 * Solo plan → только "point" scope, табы скрыты, полный доступ.
 * Fixed → "point" (если can_manage) + "staff" (read-only просмотр если can_work).
 * Mixed → "point" (если can_manage) + "staff" (редактируемый если can_work).
 */
export function useSchedulePermissions({
  userFlags,
  pointContext,
  isSoloPlan = false,
}: UseSchedulePermissionsArgs): UseSchedulePermissionsResult {
  return useMemo(() => {
    const scheduleType: ScheduleType = pointContext?.schedule_type ?? "mixed";
    const canWork = userFlags?.can_work ?? false;
    const canManagePoint = userFlags?.can_manage_point_schedule ?? false;

    /* Solo: владелец управляет расписанием точки напрямую, табов нет. */
    if (isSoloPlan) {
      return {
        canEditPointSchedule: true,
        canEditOwnSchedule: false,
        isPointScheduleFixed: false,
        isSoloPlan: true,
        scopeOptions: ["point"] as ScheduleScope[],
        defaultScope: "point" as ScheduleScope,
      };
    }

    const isPointScheduleFixed = scheduleType === "fixed";
    const canEditPointSchedule = canManagePoint;
    /* Свой график мастер правит только при mixed и наличии can_work. */
    const canEditOwnSchedule = canWork && !isPointScheduleFixed;

    const scopeOptions: ScheduleScope[] = [];
    if (canEditPointSchedule) scopeOptions.push("point");
    /* Staff таб виден если can_work — при fixed он будет read-only. */
    if (canWork) scopeOptions.push("staff");

    const defaultScope: ScheduleScope = scopeOptions.includes("staff")
      ? "staff"
      : "point";

    return {
      canEditPointSchedule,
      canEditOwnSchedule,
      isPointScheduleFixed,
      isSoloPlan: false,
      scopeOptions,
      defaultScope,
    };
  }, [
    userFlags?.can_work,
    userFlags?.can_manage_point_schedule,
    pointContext?.schedule_type,
    isSoloPlan,
  ]);
}
