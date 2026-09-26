const API_URL =
  "http://localhost:5000/api/promo-codes";

export type PromoValidationResult = {
  valid: boolean;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
};

export const validatePromoCode =
  async (
    code: string,
    subtotal: number,
  ): Promise<PromoValidationResult> => {
    const response = await fetch(
      `${API_URL}/validate`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          code,
          subtotal,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Invalid promo code.",
      );
    }

    return data;
  };