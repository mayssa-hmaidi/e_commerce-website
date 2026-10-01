import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/orders";

// =========================================
// CUSTOMER ORDER TYPES
// =========================================

export type CreateOrderItem = {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

export type CreateOrderPayload = {
  customer: {
    name: string;
    phone: string;
    email: string;
  };

  delivery: {
    governorate: string;
    city: string;
    address: string;
    additionalDetails: string;
  };

  items: CreateOrderItem[];

  promoCode?: string;
};

export type CustomerOrder = {
  _id: string;
  orderNumber: string;

  customer: {
    name: string;
    phone: string;
    email: string;
  };

  delivery: {
    governorate: string;
    city: string;
    address: string;
    additionalDetails: string;
  };

  items: CreateOrderItem[];

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
// CREATE CUSTOMER ORDER
// =========================================

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CustomerOrder> => {
  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create order.",
    );
  }

  return data;
};

// =========================================
// ADMIN ORDER TYPE
// =========================================

export type AdminOrderItem = {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

export type AdminOrder = {
  _id: string;
  orderNumber: string;

  customer: {
    name: string;
    phone: string;
    email: string;
  };

  delivery: {
    governorate: string;
    city: string;
    address: string;
    additionalDetails: string;
  };

  items: AdminOrderItem[];

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
// GET ALL ORDERS
// =========================================

export const getAdminOrders =
  async (): Promise<AdminOrder[]> => {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch orders.",
      );
    }

    return data;
  };

// =========================================
// GET ORDER BY ID
// =========================================

export const getAdminOrderById = async (
  id: string,
): Promise<AdminOrder> => {
  const response = await fetch(`${API_URL}/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch order.",
    );
  }

  return data;
};

// =========================================
// UPDATE ORDER STATUS
// =========================================

export const updateAdminOrderStatus =
  async (
    id: string,
    status: AdminOrder["status"],
  ): Promise<AdminOrder> => {
    const response = await fetch(
      `${API_URL}/${id}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update order status.",
      );
    }

    return data;
  };