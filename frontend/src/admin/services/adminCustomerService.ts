const API_URL =
  "http://localhost:5000/api/customers";

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
// ADMIN TOKEN
// =========================================

const getAdminToken = (): string | null => {
  return localStorage.getItem(
    "adminToken"
  );
};

// =========================================
// GET CUSTOMERS
// =========================================

export const getAdminCustomers =
  async (): Promise<AdminCustomer[]> => {
    const token =
      getAdminToken();

    if (!token) {
      throw new Error(
        "Admin authentication required."
      );
    }

    const response = await fetch(
      API_URL,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    let data: unknown = null;

    try {
      data =
        await response.json();
    } catch {
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