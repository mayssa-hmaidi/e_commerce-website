import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  type Customer,
  type LoginCustomerPayload,
  type RegisterCustomerPayload,
} from "../services/customerAuthService";

type CustomerAuthContextType = {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginCustomerPayload) => Promise<Customer>;

  register: (payload: RegisterCustomerPayload) => Promise<Customer>;

  logout: () => void;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined,
);

// =========================================
// PROVIDER
// =========================================

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // =======================================
  // RESTORE SESSION
  // =======================================

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentCustomer = await getCurrentCustomer();

        setCustomer(currentCustomer);

        localStorage.setItem("customer", JSON.stringify(currentCustomer));
      } catch (error) {
        console.error("Customer session restore error:", error);

        localStorage.removeItem("customer");
        setCustomer(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =======================================
  // LOGIN
  // =======================================

  const login = async (payload: LoginCustomerPayload) => {
    const result = await loginCustomer(payload);

    localStorage.setItem("customer", JSON.stringify(result.customer));

    setCustomer(result.customer);

    return result.customer;
  };

  // =======================================
  // REGISTER
  // =======================================

  const register = async (payload: RegisterCustomerPayload) => {
    const result = await registerCustomer(payload);

    localStorage.setItem("customer", JSON.stringify(result.customer));

    setCustomer(result.customer);

    return result.customer;
  };

  // =======================================
  // LOGOUT
  // =======================================

  const logout = () => {
    void logoutCustomer().catch((error) => {
      console.error("Customer logout failed:", error);
    });

    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

// =========================================
// HOOK
// =========================================

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error(
      "useCustomerAuth must be used inside CustomerAuthProvider.",
    );
  }

  return context;
}
