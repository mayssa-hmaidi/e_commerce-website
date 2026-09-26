import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./About.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main>
        <section className="about-hero">
          <p>OUR STORY</p>

          <h1>
            WEAR YOUR
            <br />
            IDENTITY
          </h1>

          <p className="about-intro">
            We believe clothing is more than what you wear. It is a way to
            express who you are.
          </p>
        </section>

        <section className="about-content">
          <div className="about-block">
            <h2>Our Brand</h2>

            <p>
              We create T-shirts designed for people who want to express their
              personality through what they wear.
            </p>
          </div>

          <div className="about-block">
            <h2>Our Vision</h2>

            <p>
              Original designs, comfortable products and a style that feels
              authentic to you.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
