import { Link } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import type { Product } from "../../types/product";
import "./NewDrop.css";

type NewDropProps = {
  products: Product[];
};

function NewDrop({ products }: NewDropProps) {
  return (
    <section className="new-drop">
      <div className="new-drop-header">
        <div>
          <p className="new-drop-label">JUST IN</p>

          <h2>New Drop</h2>
        </div>

        <Link to="/tshirts">
          View All <span>→</span>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="new-drop-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="new-drop-empty">
          <p>New products coming soon.</p>
        </div>
      )}
    </section>
  );
}

export default NewDrop;