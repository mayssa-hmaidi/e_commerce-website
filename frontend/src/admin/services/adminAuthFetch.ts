import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "";

type AdminFetchOptions = RequestInit & {
  redirectOnUnauthorized?: boolean;
};

export const adminFetch = async (
  path: string,
  options: AdminFetchOptions = {}
): Promise<Response> => {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("admin");

    if (options.redirectOnUnauthorized !== false) {
      window.location.href = "/admin/login";
    }

    throw new Error("Admin session expired.");
  }

  return response;
};