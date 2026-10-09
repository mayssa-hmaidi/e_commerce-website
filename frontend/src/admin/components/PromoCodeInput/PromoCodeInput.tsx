import { useState, type SubmitEvent } from "react";
import {
  validatePromoCode,
  type PromoValidationResult,
} from "../../../services/promoCodeService";

import "./PromoCodeInput.css";

type PromoCodeInputProps = {
  subtotal: number;

  appliedPromo: PromoValidationResult | null;

  onPromoApplied: (promo: PromoValidationResult) => void;

  onPromoRemoved: () => void;
};

function PromoCodeInput({
  subtotal,
  appliedPromo,
  onPromoApplied,
  onPromoRemoved,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!code.trim()) {
      setError("Enter a promo code.");

      return;
    }

    try {
      setLoading(true);
      setError("");

      const promo = await validatePromoCode(code, subtotal);

      onPromoApplied(promo);

      setCode(promo.code);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid promo code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    onPromoRemoved();
  };

  if (appliedPromo) {
    return (
      <div className="promo-code-box applied">
        <div className="promo-code-applied-content">
          <div className="promo-code-success-icon">
            <i className="bi bi-check-lg" />
          </div>

          <div>
            <strong>{appliedPromo.code}</strong>

            <span>
              {appliedPromo.type === "percentage"
                ? `${appliedPromo.value}% discount applied`
                : `${appliedPromo.value.toFixed(2)} DT discount applied`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="promo-code-remove"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="promo-code-box">
      <div className="promo-code-title">
        <i className="bi bi-tag" />

        <div>
          <strong>Promo Code</strong>

          <span>Have a discount code?</span>
        </div>
      </div>

      <form className="promo-code-form" onSubmit={handleSubmit}>
        <input
          aria-label="Promo code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Enter code"
          maxLength={40}
          disabled={loading}
        />

        <button type="submit" disabled={loading || !code.trim()}>
          {loading ? "Checking..." : "Apply"}
        </button>
      </form>

      {error && (
        <div className="promo-code-error">
          <i className="bi bi-exclamation-circle" />

          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;
