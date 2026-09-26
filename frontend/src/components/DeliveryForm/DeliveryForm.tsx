import "./DeliveryForm.css";

type DeliveryFormProps = {
  governorate: string;
  city: string;
  address: string;
  additionalDetails: string;

  onGovernorateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAdditionalDetailsChange: (value: string) => void;
};

function DeliveryForm({
  governorate,
  city,
  address,
  additionalDetails,
  onGovernorateChange,
  onCityChange,
  onAddressChange,
  onAdditionalDetailsChange,
}: DeliveryFormProps) {
  return (
    <div className="delivery-form">
      <div className="delivery-form-grid">
        {/* GOVERNORATE */}

        <div className="delivery-field">
          <label htmlFor="governorate">Governorate</label>

          <input
            id="governorate"
            type="text"
            placeholder="Your governorate"
            value={governorate}
            onChange={(e) => onGovernorateChange(e.target.value)}
          />
        </div>

        {/* CITY */}

        <div className="delivery-field">
          <label htmlFor="city">City</label>

          <input
            id="city"
            type="text"
            placeholder="Your city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>

        {/* ADDRESS */}

        <div className="delivery-field delivery-field-full">
          <label htmlFor="address">Address</label>

          <input
            id="address"
            type="text"
            placeholder="Street address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>

        {/* ADDITIONAL DETAILS */}

        <div className="delivery-field delivery-field-full">
          <label htmlFor="additionalDetails">
            Additional details
            <span> (optional)</span>
          </label>

          <input
            id="additionalDetails"
            type="text"
            placeholder="Apartment, building, floor, etc."
            value={additionalDetails}
            onChange={(e) => onAdditionalDetailsChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default DeliveryForm;
