import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../types/cart";

type CartContextType = {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (productId: string, color: string, size: string) => void;

  increaseQuantity: (productId: string, color: string, size: string) => void;

  decreaseQuantity: (productId: string, color: string, size: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

const CART_STORAGE_KEY = "shoppingCart";

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size,
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.color === item.color &&
          cartItem.size === item.size
            ? {
                ...cartItem,
                quantity: cartItem.quantity + item.quantity,
              }
            : cartItem,
        );
      }

      return [...currentCart, item];
    });
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (cartItem) =>
          !(
            cartItem.productId === productId &&
            cartItem.color === color &&
            cartItem.size === size
          ),
      ),
    );
  };

  const increaseQuantity = (productId: string, color: string, size: string) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.productId === productId &&
        cartItem.color === color &&
        cartItem.size === size
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem,
      ),
    );
  };

  const decreaseQuantity = (productId: string, color: string, size: string) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.productId === productId &&
        cartItem.color === color &&
        cartItem.size === size &&
        cartItem.quantity > 1
          ? {
              ...cartItem,
              quantity: cartItem.quantity - 1,
            }
          : cartItem,
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
