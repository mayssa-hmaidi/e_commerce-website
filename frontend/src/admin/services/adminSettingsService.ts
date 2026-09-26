const API_URL = "http://localhost:5000/api";

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

const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

export const getShopSettings = async (): Promise<ShopSettings> => {
  const token = getAdminToken();

  const response = await fetch(`${API_URL}/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
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
  const token = getAdminToken();

  const response = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(settings),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update settings.");
  }

  return data.settings;
};