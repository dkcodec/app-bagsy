"use client";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "../services/analytics-service";
import type { AnalyticsParams } from "../types/analytics";

/** Общий staleTime для аналитики — 5 минут (как в QueryProvider по умолчанию). */
const ANALYTICS_STALE_TIME = 5 * 60 * 1000;

/** Проверка что период задан — иначе query disabled. */
const isPeriodReady = (p: AnalyticsParams) => !!p.from && !!p.to;

/** Сводка для главной /analytics. */
export function useOverviewAnalytics(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", "overview", params],
    queryFn: () => AnalyticsService.getOverview(params),
    enabled: isPeriodReady(params),
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/**
 * Личная аналитика /analytics/me.
 * employeeId не уходит в query (бэк берёт из токена), но остаётся в queryKey —
 * иначе при логауте + логине под другого сотрудника кэш бы показал чужие данные.
 */
export function useMyAnalytics(params: AnalyticsParams, employeeId?: string) {
  return useQuery({
    queryKey: ["analytics", "me", employeeId, params],
    queryFn: () => AnalyticsService.getMyAnalytics(params),
    enabled: isPeriodReady(params) && !!employeeId,
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/** Список мастеров /analytics/staff. */
export function useStaffReport(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", "staff", params],
    queryFn: () => AnalyticsService.getStaffReport(params),
    enabled: isPeriodReady(params),
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/** Drill-down по мастеру /analytics/staff/[id]. */
export function useEmployeeAnalytics(
  employeeId: string | undefined,
  params: AnalyticsParams
) {
  return useQuery({
    queryKey: ["analytics", "employee", employeeId, params],
    queryFn: () => AnalyticsService.getEmployeeAnalytics(employeeId!, params),
    enabled: isPeriodReady(params) && !!employeeId,
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/** Сводка по локации /analytics/locations/[id] (Network Owner). */
export function useLocationAnalytics(
  locationId: string | undefined,
  params: AnalyticsParams
) {
  return useQuery({
    queryKey: ["analytics", "location", locationId, params],
    queryFn: () => AnalyticsService.getLocationAnalytics(locationId!, params),
    enabled: isPeriodReady(params) && !!locationId,
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/** Финансовый отчёт /analytics/finance. */
export function useFinanceReport(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", "finance", params],
    queryFn: () => AnalyticsService.getFinanceReport(params),
    enabled: isPeriodReady(params),
    staleTime: ANALYTICS_STALE_TIME,
  });
}

/** Клиенты /analytics/clients (Beta). */
export function useClientsAnalytics(params: AnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", "clients", params],
    queryFn: () => AnalyticsService.getClientsAnalytics(params),
    enabled: isPeriodReady(params),
    staleTime: ANALYTICS_STALE_TIME,
  });
}
