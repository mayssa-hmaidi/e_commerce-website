import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api";

export type AdminContactMessage = {
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

const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const getAdminContactMessages = async (): Promise<
  AdminContactMessage[]
> => {
  const response = await fetch(`${API_URL}/contact-messages/admin`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load messages.");
  }

  return data;
};

export const markAdminContactMessageRead = async (
  id: string,
): Promise<AdminContactMessage> => {
  const response = await fetch(`${API_URL}/contact-messages/admin/${id}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to mark message as read.");
  }

  return data;
};

export const deleteAdminContactMessage = async (
  id: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/contact-messages/admin/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete message.");
  }
};