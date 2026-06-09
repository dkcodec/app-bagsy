/**
 * Публичный API фичи аналитики.
 * Импортируется из app/[locale]/(sidebar)/analytics/**.
 */

export { AnalyticsHeader } from "./analytics-header";
export { AnalyticsGuard } from "./components/analytics-guard";

export { AnalyticsOverview } from "./overview/analytics-overview";
export { AnalyticsMe } from "./me/analytics-me";
export { AnalyticsStaff } from "./staff/analytics-staff";
export { EmployeeDetail } from "./staff/employee-detail";
export { AnalyticsFinance } from "./finance/analytics-finance";
export { AnalyticsClients } from "./clients/analytics-clients";
export { LocationDetail } from "./locations/location-detail";

export { getAnalyticsAccess } from "./utils/access";
