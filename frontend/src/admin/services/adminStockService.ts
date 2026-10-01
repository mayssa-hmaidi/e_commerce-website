import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api";

export type StockProduct = {
  _id: string;

  name: string;

  price?: number;

  discount?: number;

  description?: string;

  images?: string[];

  colors?: string[];

  sizes?: string[];

  stock: number;

  category?: string;

  updatedAt?: string;
};

export const getAdminStockProducts =
  async (): Promise<StockProduct[]> => {
    const response = await fetch(
      `${API_URL}/products`,
      {
        method: "GET",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load products",
      );
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.products)) {
      return data.products;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  };