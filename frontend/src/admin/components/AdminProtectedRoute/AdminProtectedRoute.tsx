import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getAdminProfile } from "../../services/adminProfileService";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getAdminProfile()
      .then((admin) => {
        localStorage.setItem("admin", JSON.stringify(admin));
        if (isCurrent) setIsAuthorized(true);
      })
      .catch(() => {
        localStorage.removeItem("admin");
        if (isCurrent) setIsAuthorized(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (isAuthorized === null) {
    return <div role="status">Checking admin session...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default AdminProtectedRoute;
