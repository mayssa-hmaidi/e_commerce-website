import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  getPublicContactSettings,
  type PublicContactSettings,
} from "../../services/contactService";

import "./StoreInfo.css";

export type StoreInfoPage =
  | "shipping"
  | "returns"
  | "faq"
  | "privacy"
  | "terms";

type StoreInfoProps = {
  page: StoreInfoPage;
};

const pageHeadings: Record<
  StoreInfoPage,
  { eyebrow: string; title: string; intro: string }
> = {
  shipping: {
    eyebrow: "ORDERS & DELIVERY",
    title: "Shipping",
    intro: "Delivery details for Urban Threads orders.",
  },
  returns: {
    eyebrow: "CUSTOMER CARE",
    title: "Returns & Exchanges",
    intro:
      "Information about the return window currently advertised by the store.",
  },
  faq: {
    eyebrow: "CUSTOMER CARE",
    title: "Frequently Asked Questions",
    intro: "Answers about orders, payments, products, and delivery.",
  },
  privacy: {
    eyebrow: "YOUR INFORMATION",
    title: "Privacy Information",
    intro:
      "How information entered into this store is used to provide its services.",
  },
  terms: {
    eyebrow: "STORE INFORMATION",
    title: "Terms & Conditions",
    intro: "General terms for browsing and ordering from Urban Threads.",
  },
};

function StoreInfo({ page }: StoreInfoProps) {
  const [publicSettings, setPublicSettings] =
    useState<PublicContactSettings | null>(null);
  const [settingsFailed, setSettingsFailed] = useState(false);

  useEffect(() => {
    if (page !== "shipping") {
      return;
    }

    let active = true;

    getPublicContactSettings()
      .then((settings) => {
        if (active) {
          setPublicSettings(settings);
          setSettingsFailed(false);
        }
      })
      .catch(() => {
        if (active) {
          setSettingsFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  const heading = pageHeadings[page];

  return (
    <div className="store-info-page">
      <Navbar />
      <main className="store-info-main">
        <header className="store-info-header">
          <p>{heading.eyebrow}</p>
          <h1>{heading.title}</h1>
          <span>{heading.intro}</span>
        </header>

        {page === "shipping" && (
          <div className="store-info-sections">
            <section>
              <h2>Delivery area</h2>
              <p>
                The storefront currently advertises delivery across Tunisia.
                Checkout collects your governorate, city, and street address;
                contact us if you need to confirm delivery to a specific
                address.
              </p>
            </section>
            <section>
              <h2>Delivery estimate</h2>
              <p>
                The storefront currently advertises delivery in 1–3 business
                days. An exact processing or arrival estimate is not configured;
                availability and destination may affect delivery.
              </p>
            </section>
            <section>
              <h2>Shipping cost</h2>
              {publicSettings ? (
                <p>
                  The current configured shipping charge is{" "}
                  <strong>
                    {Number(publicSettings.shippingCost).toFixed(2)}{" "}
                    {publicSettings.currency}
                  </strong>
                  . The same charge is shown in the order summary before
                  checkout.
                </p>
              ) : settingsFailed ? (
                <p>
                  The shipping charge is shown in your order summary before
                  checkout.
                </p>
              ) : (
                <p>Loading the current shipping charge…</p>
              )}
            </section>
            <section>
              <h2>Delivery information</h2>
              <p>
                Please provide a complete and accurate phone number and address.
                If you notice incorrect details after ordering, contact support
                as soon as possible and include your order number; changes may
                not be possible after dispatch.
              </p>
            </section>
            <section>
              <h2>Need help?</h2>
              <p>
                Contact us through the <Link to="/contact">Contact page</Link>{" "}
                with delivery questions or an order number.
              </p>
            </section>
          </div>
        )}

        {page === "returns" && (
          <div className="store-info-sections">
            <section>
              <h2>Return window</h2>
              <p>
                The current storefront advertises returns within 7 days. Contact
                support before sending an item back so the store can confirm the
                next steps for your order.
              </p>
            </section>
            <section>
              <h2>Eligibility and exchanges</h2>
              <p>
                Detailed eligibility, item-condition, and exchange procedures
                are not configured on the website. Contact support with your
                order number and the item you would like to return or exchange;
                the store will confirm what can be arranged.
              </p>
            </section>
            <section>
              <h2>Contact support</h2>
              <p>
                Use the <Link to="/contact">Contact page</Link> before returning
                an item.
              </p>
            </section>
          </div>
        )}

        {page === "faq" && (
          <div className="store-info-faq">
            <details>
              <summary>How do I place an order?</summary>
              <p>
                Add products to your cart, enter your contact and delivery
                details at checkout, and confirm the order.
              </p>
            </details>
            <details>
              <summary>Which payment methods are available?</summary>
              <p>
                Checkout currently offers Cash on Delivery. Payment is collected
                when the order arrives.
              </p>
            </details>
            <details>
              <summary>How long does delivery take?</summary>
              <p>
                The storefront currently advertises 1–3 business days. Contact
                support for an estimate for your address.
              </p>
            </details>
            <details>
              <summary>How much does shipping cost?</summary>
              <p>
                The shipping charge is configured by the store and shown in your
                order summary before checkout.
              </p>
            </details>
            <details>
              <summary>Can I return or exchange an item?</summary>
              <p>
                The storefront advertises a 7-day return window. Contact support
                first to confirm eligibility and next steps.
              </p>
            </details>
            <details>
              <summary>How do I choose a product size?</summary>
              <p>
                Available sizes are listed on each product page. If you need
                help choosing, contact us before ordering.
              </p>
            </details>
            <details>
              <summary>What if a product is out of stock?</summary>
              <p>
                Product availability is shown in the shop. Contact support to
                ask about a specific item.
              </p>
            </details>
            <details>
              <summary>How can I contact Urban Threads?</summary>
              <p>
                Use the <Link to="/contact">Contact page</Link> for order,
                product, or delivery questions.
              </p>
            </details>
          </div>
        )}

        {page === "privacy" && (
          <div className="store-info-sections">
            <section>
              <h2>Information you provide</h2>
              <p>
                The store handles account details such as name, email, phone,
                and the credential used to sign in; order contact and delivery
                information; newsletter email addresses submitted through the
                opt-in form; and names, email addresses, phone numbers,
                subjects, and messages submitted through the Contact form.
              </p>
            </section>
            <section>
              <h2>How it is used</h2>
              <p>
                This information is used to create and manage accounts, process
                and deliver orders, respond to contact requests, and send
                newsletter updates to people who explicitly subscribe.
                Newsletter subscriptions are separate from customer accounts.
              </p>
            </section>
            <section>
              <h2>Questions</h2>
              <p>
                For questions about information you submitted, contact us
                through the <Link to="/contact">Contact page</Link>.
              </p>
            </section>
          </div>
        )}

        {page === "terms" && (
          <div className="store-info-sections">
            <section>
              <h2>Products and availability</h2>
              <p>
                Product descriptions, options, prices, and availability are
                presented on the product pages and may change as the catalog is
                updated. Orders are subject to product availability and
                confirmation by the store.
              </p>
            </section>
            <section>
              <h2>Orders and payment</h2>
              <p>
                Provide accurate contact and delivery details when placing an
                order. The current checkout payment method is Cash on Delivery.
                The order summary displays the current totals before
                confirmation.
              </p>
            </section>
            <section>
              <h2>Returns and support</h2>
              <p>
                The storefront currently advertises a 7-day return window.
                Please review the <Link to="/returns">Returns page</Link> and
                contact support to confirm the steps for your order.
              </p>
            </section>
            <section>
              <h2>Contact</h2>
              <p>
                Questions about these terms can be sent through the{" "}
                <Link to="/contact">Contact page</Link>.
              </p>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default StoreInfo;
