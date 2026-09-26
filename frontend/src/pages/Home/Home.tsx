import { useEffect, useState } from "react";
import Features from "../../components/Features/Features";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import NewDrop from "../../components/NewDrop/NewDrop";
import Footer from "../../components/Footer/Footer";

import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

import "./Home.css";

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();

        // New Drop = first 3 products
        setProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      <Navbar />

      <main>
        <Hero />
        <Features />
        {!loading && <NewDrop products={products} />}
      </main>

      <Footer />
    </div>
  );
}

export default Home;
