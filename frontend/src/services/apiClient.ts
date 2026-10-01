const configuredApiOrigin = String(import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredApiOrigin}${normalizedPath}`;
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  try {
    const response = await globalThis.fetch(apiUrl(path), {
      ...options,
      credentials: options.credentials || "include",
    });

    if (response.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const publicAdminPaths = [
        "/admin/login",
        "/admin/forgot-password",
        "/admin/reset-password",
      ];
      const isAdminPage = currentPath.startsWith("/admin") &&
        !publicAdminPaths.includes(currentPath);
      const protectedCustomerPaths = [
        "/checkout",
        "/account",
        "/profile",
        "/my-orders",
        "/orders",
        "/favorites",
        "/order-tracking",
      ];
      const isCustomerPage = protectedCustomerPaths.some(
        (protectedPath) =>
          currentPath === protectedPath ||
          currentPath.startsWith(`${protectedPath}/`),
      );

      if (isAdminPage) {
        localStorage.removeItem("admin");
        window.location.assign("/admin/login");
      } else if (isCustomerPage) {
        localStorage.removeItem("customer");
        window.location.assign("/login");
      }
    }

    return response;
  } catch {
    throw new Error(
      "The server could not be reached. Check your connection and try again.",
    );
  }
};