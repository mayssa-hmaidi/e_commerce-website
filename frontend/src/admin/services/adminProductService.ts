import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/products";

export type AdminProductVariant = {
  color: string;
  images: string[];
};

export type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  discount: number;
  description: string;
  variants: AdminProductVariant[];
  sizes: string[];
  stock: number;
};

export type CreateProductData = {
  name: string;
  price: number;
  discount: number;
  description: string;
  variants: AdminProductVariant[];
  sizes: string[];
  stock: number;
};

export type UpdateProductData = {
  name: string;
  price: number;
  discount: number;
  description: string;
  variants: AdminProductVariant[];
  sizes: string[];
  stock: number;
};

// GET ALL PRODUCTS
export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get products.");
  }

  return data;
};

// GET ONE PRODUCT
export const getAdminProductById = async (
  id: string
): Promise<AdminProduct> => {
  const response = await fetch(`${API_URL}/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get product.");
  }

  return data;
};

// CREATE PRODUCT
export const createAdminProduct = async (
  productData: CreateProductData
): Promise<AdminProduct> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create product.");
  }

  return data;
};

// UPDATE PRODUCT
export const updateAdminProduct = async (
  id: string,
  productData: UpdateProductData
): Promise<AdminProduct> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update product.");
  }

  return data;
};

// DELETE PRODUCT
export const deleteAdminProduct = async (
  id: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete product.");
  }
};