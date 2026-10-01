import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/analytics";

export type AnalyticsTimelineItem = {
  key: string;
  label: string;
  sales: number;
  orders: number;
};

export type AnalyticsStatusItem = {
  _id: string;
  count: number;
};

export type AnalyticsTopProduct = {
  _id: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type AnalyticsOverview = {
  period: string;

  summary: {
    totalSales: number;
    totalOrders: number;
    totalItemsSold: number;
    averageOrderValue: number;
  };

  salesTimeline: AnalyticsTimelineItem[];

  ordersByStatus: AnalyticsStatusItem[];

  topProducts: AnalyticsTopProduct[];
};

export const getAnalyticsOverview = async (
  period: "7d" | "30d" | "12m" = "30d",
): Promise<AnalyticsOverview> => {
  const response = await fetch(
    `${API_URL}/overview?period=${period}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load analytics.",
    );
  }

  return data;
};