import type { Product } from "../../types/product";

import "./ProductFilters.css";

type ProductFiltersProps = {
  products: Product[];

  selectedColors: string[];
  selectedSizes: string[];

  minPrice: number;
  maxPrice: number;

  priceRange: {
    min: number;
    max: number;
  };

  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;

  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;

  onReset: () => void;
};

function ProductFilters({
  products,
  selectedColors,
  selectedSizes,
  minPrice,
  maxPrice,
  priceRange,
  onColorChange,
  onSizeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: ProductFiltersProps) {
  // ================================
  // AVAILABLE COLORS
  // ================================

  const availableColors = Array.from(
    new Set(
      products.flatMap((product) =>
        product.variants.map((variant) => variant.color),
      ),
    ),
  );

  // ================================
  // AVAILABLE SIZES
  // ================================

  const availableSizes = Array.from(
    new Set(products.flatMap((product) => product.sizes)),
  );

  return (
    <aside className="product-filters">
      <div className="product-filters-header">
        <h2>FILTERS</h2>

        <button
          type="button"
          onClick={onReset}
          className="reset-filters-button"
        >
          Reset
        </button>
      </div>

      {/* ================================= */}
      {/* COLORS */}
      {/* ================================= */}

      <section className="filter-section">
        <h3>COLOR</h3>

        <div className="filter-options">
          {availableColors.map((color) => (
            <label key={color} className="filter-option">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => onColorChange(color)}
              />

              <span className="custom-checkbox" />

              <span>{color}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ================================= */}
      {/* SIZE */}
      {/* ================================= */}

      <section className="filter-section">
        <h3>SIZE</h3>

        <div className="filter-options">
          {availableSizes.map((size) => (
            <label key={size} className="filter-option">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => onSizeChange(size)}
              />

              <span className="custom-checkbox" />

              <span>{size}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ================================= */}
      {/* PRICE */}
      {/* ================================= */}

      <section className="filter-section">
        <h3>PRICE</h3>

        <div className="price-range">
          <div className="price-range-values">
            <span>{minPrice} DT</span>
            <span>{maxPrice} DT</span>
          </div>

          <div className="price-inputs">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={minPrice}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (value <= maxPrice) {
                  onMinPriceChange(value);
                }
              }}
            />

            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={maxPrice}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (value >= minPrice) {
                  onMaxPriceChange(value);
                }
              }}
            />
          </div>
        </div>
      </section>
    </aside>
  );
}

export default ProductFilters;
