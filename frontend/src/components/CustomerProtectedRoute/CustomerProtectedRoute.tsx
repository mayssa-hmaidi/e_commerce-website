import { Navigate, useLocation } from "react-router-dom";

import { useCustomerAuth } from "../../context/CustomerAuthContext";

type CustomerProtectedRouteProps = {
  children: React.ReactNode;
};

function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useCustomerAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "60vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          color: "#111",

          fontSize: "12px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}

export default CustomerProtectedRoute;
