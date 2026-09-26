const API_URL = "http://localhost:5000/api";
const CONTACT_MESSAGES_URL = `${API_URL}/contact-messages`;

export type ContactMessagePayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
  updatedAt: string;
};

export type PublicContactSettings = {
  supportEmail: string;
  whatsapp: string;
  phone: string;
  storeName: string;
  currency: string;
  shippingCost: number;
  address: string;
  supportHours: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

// =========================================
// SEND CONTACT MESSAGE
// =========================================

export const sendContactMessage = async (
  payload: ContactMessagePayload,
): Promise<ContactMessage> => {
  const response = await fetch(CONTACT_MESSAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send your message.",
    );
  }

  return data;
};

// =========================================
// GET PUBLIC CONTACT SETTINGS
// =========================================

export const getPublicContactSettings =
  async (): Promise<PublicContactSettings> => {
    const response = await fetch(
      `${API_URL}/settings/contact`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load contact information.",
      );
    }

    return data;
  };