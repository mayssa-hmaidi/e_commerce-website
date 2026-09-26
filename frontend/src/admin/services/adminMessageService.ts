const API_URL = "http://localhost:5000/api/contact-messages";

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

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

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
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(response);

  return Array.isArray(data) ? data : [];
}

// =========================================
// GET ONE MESSAGE
// =========================================

export async function getAdminContactMessageById(
  id: string,
): Promise<AdminContactMessage> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

// =========================================
// MARK AS READ
// =========================================

export async function markAdminContactMessageAsRead(
  id: string,
): Promise<AdminContactMessage> {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(
    `${API_URL}/${id}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseResponse(response);
}