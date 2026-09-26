import { Link } from "react-router-dom";
import "./Hero.css";

import heroImage from "../../assets/hero-bg.jpg";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="hero">
      <img
        src={heroImage}
        alt="T-shirt collection"
        className="hero-image"
      />

      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-label">NEW COLLECTION</p>

        <h1>
          WEAR YOUR IDENTITY
        </h1>

       <p className="hero-subtitle">
          T-shirts made for your style
        </p>

        <Link
          to="/tshirts"
          className="hero-button"
        >
          <span>SHOP NOW</span>
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

export default Hero;