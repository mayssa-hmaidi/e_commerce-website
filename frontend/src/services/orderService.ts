const API_URL = "http://localhost:5000/api/orders";

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
// CUSTOMER TOKEN
// =========================================

const getCustomerToken = (): string | null => {
  return localStorage.getItem("customerToken");
};

// =========================================
// CREATE ORDER
// =========================================

export const createOrder = async (
  orderData: CreateOrderPayload
): Promise<CustomerOrder> => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error(
      "You must be logged in to place an order."
    );
  }

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
    const token = getCustomerToken();

    if (!token) {
      throw new Error(
        "You must be logged in to view your orders."
      );
    }

    const response = await fetch(
      `${API_URL}/my-orders`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
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
// ADMIN TOKEN
// =========================================

const getAdminToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

// =========================================
// GET ALL ADMIN ORDERS
// =========================================

export const getAdminOrders =
  async (): Promise<AdminOrder[]> => {
    const token = getAdminToken();

    if (!token) {
      throw new Error(
        "Admin authentication required."
      );
    }

    const response = await fetch(API_URL, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
    const token = getAdminToken();

    if (!token) {
      throw new Error(
        "Admin authentication required."
      );
    }

    const response = await fetch(
      `${API_URL}/${orderId}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
    const token = getAdminToken();

    if (!token) {
      throw new Error(
        "Admin authentication required."
      );
    }

    const response = await fetch(
      `${API_URL}/${orderId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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