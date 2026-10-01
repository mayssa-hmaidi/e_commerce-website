import { apiFetch as fetch } from "../../services/apiClient";

const API_URL = "/api/admin";

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

// =========================================
// GET PROFILE
// =========================================

export const getAdminProfile =
  async (): Promise<AdminProfile> => {
    const response = await fetch(
      `${API_URL}/profile`,
      {
        method: "GET",
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

        headers: { "Content-Type": "application/json" },

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

        headers: { "Content-Type": "application/json" },

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