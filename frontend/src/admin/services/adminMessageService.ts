import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/contact-messages";

export type AdminContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong.",
    );
  }

  return data;
}

// =========================================
// GET ALL MESSAGES
// =========================================

export async function getAdminContactMessages(): Promise<
  AdminContactMessage[]
> {
    const response = await fetch(API_URL);

  const data = await parseResponse(response);

  return Array.isArray(data) ? data : [];
}

// =========================================
// GET ONE MESSAGE
// =========================================

export async function getAdminContactMessageById(
  id: string,
): Promise<AdminContactMessage> {
  const response = await fetch(`${API_URL}/${id}`);

  return parseResponse(response);
}

// =========================================
// MARK AS READ
// =========================================

export async function markAdminContactMessageAsRead(
  id: string,
): Promise<AdminContactMessage> {
  const response = await fetch(
    `${API_URL}/${id}/read`,
    {
      method: "PUT",
    },
  );

  const data = await parseResponse(response);

  return data.contactMessage;
}

// =========================================
// DELETE
// =========================================

export async function deleteAdminContactMessage(
  id: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await parseResponse(response);
}