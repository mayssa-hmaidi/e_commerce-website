const API_URL =
  "http://localhost:5000/api/customer-auth";

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterCustomerPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginCustomerPayload = {
  email: string;
  password: string;
};

export type CustomerAuthResponse = {
  message: string;
  token: string;
  customer: Customer;
};

export type PasswordResetResponse = {
  message: string;
};

// =========================================
// PARSE RESPONSE
// =========================================

const parseResponse = async (
  response: Response,
) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Request failed.",
    );
  }

  return data;
};

// =========================================
// REGISTER
// =========================================

export const registerCustomer = async (
  payload: RegisterCustomerPayload,
): Promise<CustomerAuthResponse> => {
  const response = await fetch(
    `${API_URL}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return parseResponse(
    response,
  );
};

// =========================================
// LOGIN
// =========================================

export const loginCustomer = async (
  payload: LoginCustomerPayload,
): Promise<CustomerAuthResponse> => {
  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return parseResponse(
    response,
  );
};

export const requestCustomerPasswordReset = async (
  email: string,
): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseResponse(response);
};

export const resetCustomerPassword = async (
  token: string,
  password: string,
): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  return parseResponse(response);
};

// =========================================
// GET CURRENT CUSTOMER
// =========================================

export const getCurrentCustomer =
  async (): Promise<Customer> => {
    const token =
      localStorage.getItem(
        "customerToken",
      );

    if (!token) {
      throw new Error(
        "Customer authentication required.",
      );
    }

    const response = await fetch(
      `${API_URL}/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

    return parseResponse(
      response,
    );
  };

// =========================================
// LOGOUT
// =========================================

export const logoutCustomer =
  () => {
    localStorage.removeItem(
      "customerToken",
    );

    localStorage.removeItem(
      "customer",
    );
  };