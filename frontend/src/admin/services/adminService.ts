const API_URL = "http://localhost:5000/api/admin";

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
};

export const loginAdmin = async (
  loginData: LoginData,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Login failed",
    );
  }

  return data;
};

type PasswordResetResponse = {
  message: string;
};

export const requestAdminPasswordReset = async (
  email: string,
): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to process this request.");
  }

  return data;
};

export const resetAdminPassword = async (
  token: string,
  password: string,
): Promise<PasswordResetResponse> => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to reset your password.");
  }

  return data;
};