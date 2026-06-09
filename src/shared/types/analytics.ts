/**
 * DTO-типы для раздела аналитики.
 * Контракт зеркалит docs/ANALYTICS_API_SPEC.md.
 * Эндпоинты: src/shared/services/analytics-service.ts.
 */

/**
 * Базовые параметры всех запросов аналитики.
 *
 * Период сравнения (для delta% в KPI) бэк вычисляет САМ по дефолтным правилам:
 *   today      (1 день)    → вчера
 *   7 дней     (week)      → предыдущие 7 дней (equal-length)
 *   месяц      (MTD)       → MTD прошлого месяца (1-е по ту же дату)
 *   квартал    (90 дней)   → предыдущие 90 дней (equal-length)
 *   custom     (любой N-дневный диапазон) → equal-length: N дней до from
 *
 * Эти правила должны быть зафиксированы в ТЗ для бэка.
 */
export interface AnalyticsParams {
  /** Дата начала периода (YYYY-MM-DD) */
  from: string;
  /** Дата конца периода (YYYY-MM-DD) */
  to: string;
  /** UUID локации; "all" или undefined = все локации (Network Owner) */
  location_id?: string | "all";
}

/** Значение KPI с дельтой относительно предыдущего периода. */
export interface IKpiValue {
  /** Текущее значение метрики */
  value: number;
  /** Значение в предыдущем периоде */
  prev: number;
  /** Δ% — относительное изменение; null если prev=0 */
  delta_percent: number | null;
}

/** Точка ряда — день периода. */
export interface IDailyPoint {
  /** YYYY-MM-DD */
  date: string;
  /** Текущий период */
  value: number;
  /** Тот же индекс в прошлом периоде (для overlay-сравнения) */
  prev_value?: number;
}

/** Топ-N сущностей (мастера / услуги). */
export interface ITopItem {
  id: string;
  name: string;
  /** Выручка за период */
  revenue: number;
  /** Доля в общей выручке (0..1) */
  share: number;
}

/** Воронка записей — три этапа. */
export interface IFunnelStage {
  key: "created" | "confirmed" | "completed";
  count: number;
  /** Конверсия от предыдущего этапа (0..1); для created = 1 */
  conversion: number;
}

/** Ячейка heatmap: день недели 0..6 (Пн=0), час 0..23, нагрузка 0..1. */
export interface IHeatmapCell {
  weekday: number;
  hour: number;
  value: number;
}

/** Авто-инсайт с уровнем важности. */
export interface IInsight {
  /** Стабильный ключ для i18n (например "saturdayLoad") */
  key: string;
  level: "info" | "warning" | "success";
  /** Параметры для интерполяции в перевод (имя мастера, %, и т.д.) */
  params?: Record<string, string | number>;
}

/**
 * Сводка для главной страницы /analytics (Manager/Owner).
 */
export interface IOverviewDto {
  kpi: {
    revenue: IKpiValue;
    bookings: IKpiValue;
    clients: IKpiValue;
    avg_check: IKpiValue;
    load_percent: IKpiValue;
    cancellation_percent: IKpiValue;
  };
  revenue_by_day: IDailyPoint[];
  top_employees: ITopItem[];
  top_services: ITopItem[];
  funnel: IFunnelStage[];
  heatmap: IHeatmapCell[];
  insights: IInsight[];
}

/**
 * Личная аналитика (/analytics/me) — без топов по другим людям.
 */
export interface IMyAnalyticsDto {
  kpi: IOverviewDto["kpi"];
  revenue_by_day: IDailyPoint[];
  top_services: ITopItem[];
  heatmap: IHeatmapCell[];
  /** Распределение клиентов: новые vs повторные */
  clients_breakdown: { new: number; returning: number };
}

/** Строка таблицы /analytics/staff. */
export interface IStaffReportRow {
  employee_id: string;
  full_name: string;
  revenue: number;
  bookings: number;
  avg_check: number;
  load_percent: number;
  cancellations: { count: number; percent: number };
  rating: number | null;
}

export interface IStaffReportDto {
  rows: IStaffReportRow[];
  /** Загрузка по дням недели для каждого мастера (для heatmap) */
  weekday_load: Array<{ employee_id: string; weekday: number; value: number }>;
  insights: IInsight[];
}

/** Drill-down по мастеру (/analytics/staff/[id]). */
export interface IEmployeeAnalyticsDto {
  employee: { id: string; full_name: string; avatar_url?: string };
  kpi: IOverviewDto["kpi"];
  revenue_by_day: IDailyPoint[];
  top_services: ITopItem[];
  hourly_load: Array<{ hour: number; value: number }>;
  clients_breakdown: { new: number; returning: number };
}

/** Финансовый отчёт. */
export interface IFinanceReportDto {
  revenue: {
    services: number;
    products: number;
    total: number;
  };
  payroll: Array<{
    employee_id: string;
    full_name: string;
    commission_percent: number;
    amount: number;
  }>;
  payroll_total: number;
  gross_profit: number;
  margin_percent: number;
}

/** Сегменты клиентов. */
export type TClientSegment =
  | "new"
  | "growing"
  | "regular"
  | "vip"
  | "sleeping"
  | "lost";

export interface IClientsAnalyticsDto {
  kpi: {
    total: IKpiValue;
    new: IKpiValue;
    returning: IKpiValue;
    lost: IKpiValue;
  };
  segments: Array<{ key: TClientSegment; count: number; share: number }>;
  retention: { after_1: number; after_2: number; after_3: number };
  cohorts: Array<{ month: string; new_count: number; active_percent: number }>;
}
