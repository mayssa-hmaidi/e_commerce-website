import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default AdminProtectedRoute;
