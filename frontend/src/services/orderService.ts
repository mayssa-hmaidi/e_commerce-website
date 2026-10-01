import { apiFetch as fetch } from "./apiClient";

const API_URL = "/api/orders";

// =========================================
// CUSTOMER TYPES
// =========================================

export type CreateOrderItem = {
  productId: string;
  name?: string;
  color?: string;
  size?: string;
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
    additionalDetails?: string;
  };

  items: CreateOrderItem[];

  promoCode?: string;
};

export type CustomerOrderItem = {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
};

export type CustomerOrder = {
  _id: string;
  orderNumber: string;

  items: CustomerOrderItem[];

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

  delivery?: {
    governorate: string;
    city: string;
    address: string;
    additionalDetails?: string;
  };

  createdAt: string;
  updatedAt: string;
};

export type CreatedOrderResponse = {
  message: string;
  order: CustomerOrder;
};

// =========================================
// CREATE ORDER
// =========================================

export const createOrder = async (
  orderData: CreateOrderPayload
): Promise<CustomerOrder> => {
  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to create order."
    );
  }

  return data.order;
};

// =========================================
// GET CUSTOMER ORDERS
// =========================================

export const getCustomerOrders =
  async (): Promise<CustomerOrder[]> => {
    const response = await fetch(
      `${API_URL}/my-orders`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to load your orders."
      );
    }

    return data;
  };

// =========================================
// ADMIN TYPES
// =========================================

export type AdminOrder = {
  _id: string;

  customerId?: string | null;

  customer: {
    name: string;
    phone: string;
    email: string;
  };

  orderNumber: string;

  delivery: {
    governorate: string;
    city: string;
    address: string;
    additionalDetails?: string;
  };

  items: {
    productId: string;
    name: string;
    price: number;
    color: string;
    size: string;
    quantity: number;
  }[];

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
// GET ALL ADMIN ORDERS
// =========================================

export const getAdminOrders =
  async (): Promise<AdminOrder[]> => {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to load orders."
      );
    }

    return data;
  };

// =========================================
// GET ADMIN ORDER BY ID
// =========================================

export const getAdminOrderById =
  async (
    orderId: string
  ): Promise<AdminOrder> => {
    const response = await fetch(`${API_URL}/${orderId}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to load order."
      );
    }

    return data;
  };

// =========================================
// UPDATE ADMIN ORDER STATUS
// =========================================

export const updateAdminOrderStatus =
  async (
    orderId: string,
    status: AdminOrder["status"]
  ): Promise<AdminOrder> => {
    const response = await fetch(
      `${API_URL}/${orderId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update order status."
      );
    }

    return data.order;
  };