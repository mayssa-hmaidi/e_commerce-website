import {
  createContext,
  useContext,
  useCallback,
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

  const [storedProducts, setStoredProducts] = useState<WishlistProduct[]>([]);
  const products = useMemo(
    () => (isAuthenticated ? storedProducts : []),
    [isAuthenticated, storedProducts],
  );

  const [isLoading, setIsLoading] = useState(false);

  // =====================================
  // LOAD WISHLIST
  // =====================================

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await getWishlist();

      setStoredProducts(data.products || []);
    } catch (error) {
      console.error("Wishlist loading error:", error);

      setStoredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // This effect starts an asynchronous request and updates state when it settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshWishlist();
  }, [authLoading, refreshWishlist]);

  // =====================================
  // ADD FAVORITE
  // =====================================

  const addFavorite = async (productId: string) => {
    const data = await addToWishlist(productId);

    setStoredProducts(data.products || []);
  };

  // =====================================
  // REMOVE FAVORITE
  // =====================================

  const removeFavorite = async (productId: string) => {
    const data = await removeFromWishlist(productId);

    setStoredProducts(data.products || []);
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
    isLoading: isAuthenticated && isLoading,

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
