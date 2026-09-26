const API_URL = "http://localhost:5000/api";

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

const getAdminToken = () => {
  return localStorage.getItem("adminToken");
};

const getAuthHeaders = () => {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
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