import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/promo-codes";

export type PromoCodeType =
  | "percentage"
  | "fixed";

export type AdminPromoCode = {
  _id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  minOrderAmount: number;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromoCodePayload = {
  code: string;
  type: PromoCodeType;
  value: number;
  minOrderAmount: number;
  usageLimit: number | null;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
};

const getHeaders = (): HeadersInit => {
  return {
    "Content-Type":
      "application/json",
  };
};

const parseResponse = async (
  response: Response,
) => {
  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Request failed.",
    );
  }

  return data;
};

// =========================================
// GET ALL
// =========================================

export const getAdminPromoCodes =
  async (): Promise<
    AdminPromoCode[]
  > => {
    const response =
      await fetch(API_URL, {
        headers: getHeaders(),
      });

    return parseResponse(
      response,
    );
  };

// =========================================
// CREATE
// =========================================

export const createAdminPromoCode =
  async (
    payload: PromoCodePayload,
  ): Promise<AdminPromoCode> => {
    const response =
      await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(
          payload,
        ),
      });

    return parseResponse(
      response,
    );
  };

// =========================================
// UPDATE
// =========================================

export const updateAdminPromoCode =
  async (
    id: string,
    payload: PromoCodePayload,
  ): Promise<AdminPromoCode> => {
    const response =
      await fetch(
        `${API_URL}/${id}`,
        {
          method: "PUT",
          headers: getHeaders(),
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
// TOGGLE
// =========================================

export const toggleAdminPromoCode =
  async (
    id: string,
  ): Promise<AdminPromoCode> => {
    const response =
      await fetch(
        `${API_URL}/${id}/toggle`,
        {
          method: "PATCH",
          headers: getHeaders(),
        },
      );

    return parseResponse(
      response,
    );
  };

// =========================================
// DELETE
// =========================================

export const deleteAdminPromoCode =
  async (
    id: string,
  ): Promise<{
    message: string;
  }> => {
    const response =
      await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

    return parseResponse(
      response,
    );
  };