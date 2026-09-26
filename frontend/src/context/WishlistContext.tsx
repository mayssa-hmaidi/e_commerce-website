import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useCustomerAuth } from "./CustomerAuthContext";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  type WishlistProduct,
} from "../services/wishlistService";

type WishlistContextType = {
  products: WishlistProduct[];
  productIds: string[];
  count: number;
  isLoading: boolean;

  addFavorite: (productId: string) => Promise<void>;

  removeFavorite: (productId: string) => Promise<void>;

  toggleFavorite: (productId: string) => Promise<void>;

  isFavorite: (productId: string) => boolean;

  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

type WishlistProviderProps = {
  children: ReactNode;
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();

  const [products, setProducts] = useState<WishlistProduct[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // =====================================
  // LOAD WISHLIST
  // =====================================

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setProducts([]);
      return;
    }

    try {
      setIsLoading(true);

      const data = await getWishlist();

      setProducts(data.products || []);
    } catch (error) {
      console.error("Wishlist loading error:", error);

      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshWishlist();
  }, [isAuthenticated, authLoading]);

  // =====================================
  // ADD FAVORITE
  // =====================================

  const addFavorite = async (productId: string) => {
    const data = await addToWishlist(productId);

    setProducts(data.products || []);
  };

  // =====================================
  // REMOVE FAVORITE
  // =====================================

  const removeFavorite = async (productId: string) => {
    const data = await removeFromWishlist(productId);

    setProducts(data.products || []);
  };

  // =====================================
  // TOGGLE
  // =====================================

  const toggleFavorite = async (productId: string) => {
    const favorite = products.some((product) => product._id === productId);

    if (favorite) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  };

  // =====================================
  // CHECK
  // =====================================

  const isFavorite = (productId: string) => {
    return products.some((product) => product._id === productId);
  };

  // =====================================
  // IDS
  // =====================================

  const productIds = useMemo(
    () => products.map((product) => product._id),
    [products],
  );

  const value = {
    products,
    productIds,
    count: products.length,
    isLoading,

    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// =========================================
// HOOK
// =========================================

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return context;
};
