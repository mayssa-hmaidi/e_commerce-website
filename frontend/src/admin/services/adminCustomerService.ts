import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/customers";

// =========================================
// TYPES
// =========================================

export type AdminCustomer = {
  _id: string;
  name: string;
  email: string;
  phone: string;

  orders: number;
  spent: number;

  lastOrder: string | null;
};

// =========================================
// GET CUSTOMERS
// =========================================

export const getAdminCustomers =
  async (): Promise<AdminCustomer[]> => {
    const response = await fetch(API_URL);

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      if (response.ok) {
        throw new Error("Invalid customers response from server.");
      }

      data = null;
    }

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (
          data as {
            message?: unknown;
          }
        ).message === "string"
          ? (
              data as {
                message: string;
              }
            ).message
          : `Failed to load customers. (${response.status})`;

      throw new Error(message);
    }

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid customers response from server."
      );
    }

    return data as AdminCustomer[];
  };