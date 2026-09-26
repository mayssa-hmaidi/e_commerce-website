import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "bootstrap-icons/font/bootstrap-icons.css";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.tsx";
import { WishlistProvider } from "./context/WishlistContext.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomerAuthProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CustomerAuthProvider>
  </StrictMode>,
);
