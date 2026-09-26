const API_URL =
  "http://localhost:5000/api/wishlist";

// =========================================
// TYPES
// =========================================

export type WishlistProduct = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  stock: number;
};

export type WishlistResponse = {
  wishlistId: string;
  customerId: string;
  products: WishlistProduct[];
};

// =========================================
// TOKEN
// =========================================

const getCustomerToken = (): string | null => {
  return localStorage.getItem(
    "customerToken"
  );
};

// =========================================
// AUTH HEADER
// =========================================

const getHeaders = () => {
  const token = getCustomerToken();

  if (!token) {
    throw new Error(
      "You must be logged in."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// =========================================
// GET WISHLIST
// =========================================

export const getWishlist =
  async (): Promise<WishlistResponse> => {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to load wishlist."
      );
    }

    return data;
  };

// =========================================
// ADD TO WISHLIST
// =========================================

export const addToWishlist =
  async (
    productId: string
  ): Promise<WishlistResponse> => {
    const response = await fetch(
      API_URL,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          productId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to add product to wishlist."
      );
    }

    return data;
  };

// =========================================
// REMOVE FROM WISHLIST
// =========================================

export const removeFromWishlist =
  async (
    productId: string
  ): Promise<WishlistResponse> => {
    const response = await fetch(
      `${API_URL}/${productId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to remove product from wishlist."
      );
    }

    return data;
  };

// =========================================
// CHECK PRODUCT
// =========================================

export const checkWishlist =
  async (
    productId: string
  ): Promise<boolean> => {
    const response = await fetch(
      `${API_URL}/check/${productId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to check wishlist."
      );
    }

    return data.isFavorite;
  };