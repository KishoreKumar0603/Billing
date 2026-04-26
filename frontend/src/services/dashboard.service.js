import { api } from "./api";

export const dashboardService = {
  /*
  ==========================================
  DASHBOARD SUMMARY
  ==========================================

  BACKEND:
  GET /dashboard/summary
  */

  async summary() {
    const { data } = await api.get(
      "/dashboard/summary"
    );

    return data;
  },

  /*
  ==========================================
  ORDER ANALYTICS
  ==========================================

  BACKEND:
  GET /dashboard/orders
  */

  async orders(range) {
    const { data } = await api.get(
      "/dashboard/orders",
      {
        params: {
          range,
        },
      }
    );

    return data;
  },

  /*
  ==========================================
  REVENUE ANALYTICS
  ==========================================

  BACKEND:
  GET /dashboard/revenue
  */

  async revenue(range) {
    const { data } = await api.get(
      "/dashboard/revenue",
      {
        params: {
          range,
        },
      }
    );

    return data;
  },
};