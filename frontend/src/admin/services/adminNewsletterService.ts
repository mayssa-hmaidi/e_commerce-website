import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/newsletter/admin";

export type AdminNewsletterSubscriber = {
  _id: string;
  email: string;
  subscribed: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
};

export type AdminNewsletterData = {
  activeCount: number;
  subscribers: AdminNewsletterSubscriber[];
};

const parseResponse = async <T,>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : "Unable to complete the request.",
    );
  }

  return data as T;
};

export const getAdminNewsletterSubscribers = async () => {
  const response = await fetch(API_URL);
  return parseResponse<AdminNewsletterData>(response);
};

export const unsubscribeAdminNewsletterSubscriber = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}/unsubscribe`, {
    method: "PATCH",
  });
  return parseResponse<{ message: string }>(response);
};

export const deleteAdminNewsletterSubscriber = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return parseResponse<{ message: string }>(response);
};
