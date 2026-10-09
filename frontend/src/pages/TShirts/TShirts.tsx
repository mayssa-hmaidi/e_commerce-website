import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar/Navbar";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import Footer from "../../components/Footer/Footer";

import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

import "./TShirts.css";

type SortOption = "newest" | "price-low" | "price-high" | "name";

function TShirts() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError("");

        const data = await getProducts();

        setProducts(data);

        if (data.length > 0) {
          const prices = data.map((product: Product) => product.price);

          const minimumPrice = Math.floor(Math.min(...prices));

          const maximumPrice = Math.ceil(Math.max(...prices));

          setPriceRange({
            min: minimumPrice,
            max: maximumPrice,
          });

          setMinPrice(minimumPrice);
          setMaxPrice(maximumPrice);
        }
      } catch (error) {
        console.error("Products loading error:", error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColors((currentColors) =>
      currentColors.includes(color)
        ? currentColors.filter((currentColor) => currentColor !== color)
        : [...currentColors, color],
    );
  };

  const handleSizeChange = (size: string) => {
    setSelectedSizes((currentSizes) =>
      currentSizes.includes(size)
        ? currentSizes.filter((currentSize) => currentSize !== size)
        : [...currentSizes, size],
    );
  };

  const resetFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortOption("newest");

    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // COLOR FILTER
    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        selectedColors.some((color) =>
          product.variants.some((variant) => variant.color === color),
        ),
      );
    }

    // SIZE FILTER
    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        selectedSizes.some((size) => product.sizes.includes(size)),
      );
    }

    // PRICE FILTER
    if (priceRange.max > 0) {
      result = result.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice,
      );
    }

    // SORT
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "newest":
      default:
        break;
    }

    return result;
  }, [
    products,
    selectedColors,
    selectedSizes,
    minPrice,
    maxPrice,
    priceRange.max,
    sortOption,
  ]);

  return (
    <div className="tshirts-page">
      <Navbar />

      <main>
        <section className="tshirts-header">
          <p className="tshirts-label">OUR COLLECTION</p>

          <h1>T-Shirts</h1>

          <p className="tshirts-description">
            Discover our collection of original T-shirts made for your style.
          </p>
        </section>

        <section className="tshirts-shop">
          <ProductFilters
            products={products}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            minPrice={minPrice}
            maxPrice={maxPrice}
            priceRange={priceRange}
            onColorChange={handleColorChange}
            onSizeChange={handleSizeChange}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onReset={resetFilters}
          />

          <div className="tshirts-results">
            <div className="tshirts-toolbar">
              <p>
                {loading ? "Loading..." : `${filteredProducts.length} products`}
              </p>

              <div className="tshirts-sort">
                <label htmlFor="sort">Sort by</label>

                <select
                  id="sort"
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                >
                  <option value="newest">Newest</option>

                  <option value="price-low">Price: Low to High</option>

                  <option value="price-high">Price: High to Low</option>

                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {error && <p className="tshirts-error">{error}</p>}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="tshirts-no-results">
                <h2>No products found</h2>

                <p>Try changing your filters.</p>

                <button type="button" onClick={resetFilters}>
                  RESET FILTERS
                </button>
              </div>
            )}

            {loading && (
              <div className="tshirts-loading">
                <p>Loading products...</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="tshirts-products">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default TShirts;
