import "./Features.css";

function Features() {
  return (
    <section className="features">
      <div className="feature-item">
        <i className="bi bi-truck"></i>

        <div>
          <h3>Fast Delivery</h3>
          <p>Delivery across Tunisia</p>
        </div>
      </div>

      <div className="feature-item">
        <i className="bi bi-patch-check"></i>

        <div>
          <h3>Premium Quality</h3>
          <p>Quality you can trust</p>
        </div>
      </div>

      <div className="feature-item">
        <i className="bi bi-arrow-repeat"></i>

        <div>
          <h3>Easy Returns</h3>
          <p>Simple and stress-free</p>
        </div>
      </div>

      <div className="feature-item">
        <i className="bi bi-shield-check"></i>

        <div>
          <h3>Secure Payment</h3>
          <p>Safe and reliable checkout</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
