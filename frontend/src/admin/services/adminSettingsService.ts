import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api";

export type ShopSettings = {
  _id?: string;

  storeName: string;
  currency: string;
  shippingCost: number;
  lowStockThreshold: number;

  supportEmail: string;
  whatsapp: string;

  phone: string;
  address: string;
  supportHours: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

export const getShopSettings = async (): Promise<ShopSettings> => {
  const response = await fetch(`${API_URL}/settings`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load settings.");
  }

  return data;
};

export const updateShopSettings = async (
  settings: ShopSettings,
): Promise<ShopSettings> => {
  const response = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update settings.");
  }

  return data.settings;
};