import { apiFetch as fetch } from "./apiClient";

const API_URL = "/api/orders";

// =========================================
// TRACKING ITEM
// =========================================

export type TrackingOrderItem = {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

// =========================================
// TRACKING ORDER
// =========================================

export type TrackingOrder = {
  _id: string;

  orderNumber: string;

  items: TrackingOrderItem[];

  subtotal: number;

  shipping: number;

  promoCode: string | null;

  discountAmount: number;

  total: number;

  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  createdAt: string;

  updatedAt: string;
};

// =========================================
// GET ORDER FOR TRACKING
// =========================================

export const getOrderForTracking =
  async (
    orderId: string,
  ): Promise<TrackingOrder> => {
    const response =
      await fetch(
        `${API_URL}/track/${orderId}`,
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to load order tracking.",
      );
    }

    // IMPORTANT:
    // Backend returns the order directly.
    return data;
  };