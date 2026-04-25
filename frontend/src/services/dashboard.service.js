import { mockApi } from "./mockApi";
export const dashboardService = {
  summary: () => mockApi.dashboardSummary(),
  orders: (range) => mockApi.ordersAnalytics(range),
  revenue: (range) => mockApi.revenueAnalytics(range),
};
