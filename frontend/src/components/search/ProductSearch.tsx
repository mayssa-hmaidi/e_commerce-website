import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/apiClient";
import type { Product } from "../../types/product";
import "./ProductSearch.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await apiFetch(
          `/api/search/products?q=${encodeURIComponent(trimmedQuery)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to search products.");
        }

        setProducts(data.products || []);
      } catch (searchError) {
        console.error("Product search error:", searchError);
        setProducts([]);
        setError("Unable to search products.");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);

    if (value.trim().length < 2) {
      setProducts([]);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
  };

  const showAllResults = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setIsOpen(false);
    navigate(`/tshirts?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const openProduct = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/product/${productId}`);
  };

  return (
    <div className="product-search" ref={containerRef}>
      <div className="product-search-input-wrap">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") showAllResults();
            if (event.key === "Escape") setIsOpen(false);
          }}
          placeholder="Search"
          aria-label="Search products"
        />
      </div>

      {isOpen && (
        <div className="product-search-dropdown">
          {query.trim().length < 2 ? (
            <p className="product-search-status">
              Type at least 2 characters to search.
            </p>
          ) : isLoading ? (
            <p className="product-search-status">Searching...</p>
          ) : error ? (
            <p className="product-search-status">{error}</p>
          ) : products.length === 0 ? (
            <p className="product-search-status">No products found.</p>
          ) : (
            <>
              <p className="product-search-label">SEARCH SUGGESTIONS</p>
              {products.map((product) => (
                <button
                  type="button"
                  className="product-search-result"
                  key={product._id}
                  onClick={() => openProduct(product._id)}
                >
                  <div className="product-search-image">
                    {product.variants[0]?.images[0] ? (
                      <img
                        src={product.variants[0].images[0]}
                        alt={product.name}
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                  <div className="product-search-info">
                    <strong>{product.name}</strong>
                    <span>T-Shirts</span>
                    <b>{product.price} DT</b>
                  </div>
                </button>
              ))}
              <button
                type="button"
                className="product-search-view-all"
                onClick={showAllResults}
              >
                View all search results
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductSearch;
