const API_URL =
  "http://localhost:5000/api/analytics";

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
  const token =
    localStorage.getItem("adminToken");

  if (!token) {
    throw new Error(
      "Admin authentication required.",
    );
  }

  const response = await fetch(
    `${API_URL}/overview?period=${period}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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