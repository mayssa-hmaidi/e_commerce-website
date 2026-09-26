const API_URL =
  "http://localhost:5000/api/admin";

// =========================================
// TYPES
// =========================================

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

type UpdateProfileResponse = {
  message: string;

  admin: {
    id: string;
    name: string;
    email: string;
  };
};

type ChangePasswordResponse = {
  message: string;
};

// =========================================
// HEADERS
// =========================================

const getHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// =========================================
// GET PROFILE
// =========================================

export const getAdminProfile =
  async (): Promise<AdminProfile> => {
    const response = await fetch(
      `${API_URL}/profile`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    const data =
      (await response.json()) as
        | AdminProfile
        | {
            message?: string;
          };

    if (!response.ok) {
      throw new Error(
        "message" in data &&
          data.message
          ? data.message
          : "Failed to load profile",
      );
    }

    return data as AdminProfile;
  };

// =========================================
// UPDATE PROFILE
// =========================================

export const updateAdminProfile =
  async (
    name: string,
    email: string,
  ): Promise<UpdateProfileResponse> => {
    const response = await fetch(
      `${API_URL}/profile`,
      {
        method: "PUT",

        headers: getHeaders(),

        body: JSON.stringify({
          name,
          email,
        }),
      },
    );

    const data =
      (await response.json()) as
        | UpdateProfileResponse
        | {
            message?: string;
          };

    if (!response.ok) {
      throw new Error(
        "message" in data &&
          data.message
          ? data.message
          : "Failed to update profile",
      );
    }

    return data as UpdateProfileResponse;
  };

// =========================================
// CHANGE PASSWORD
// =========================================

export const changeAdminPassword =
  async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResponse> => {
    const response = await fetch(
      `${API_URL}/change-password`,
      {
        method: "PUT",

        headers: getHeaders(),

        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      },
    );

    const data =
      (await response.json()) as
        | ChangePasswordResponse
        | {
            message?: string;
          };

    if (!response.ok) {
      throw new Error(
        "message" in data &&
          data.message
          ? data.message
          : "Failed to change password",
      );
    }

    return data as ChangePasswordResponse;
  };