import "./CustomerForm.css";

type CustomerFormProps = {
  fullName: string;
  phone: string;
  email: string;

  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

function CustomerForm({
  fullName,
  phone,
  email,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
}: CustomerFormProps) {
  return (
    <div className="checkout-form">
      <div className="checkout-form-grid">
        {/* FULL NAME */}

        <div className="checkout-field">
          <label htmlFor="fullName">
            Full Name
          </label>

          <input
            id="fullName"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) =>
              onFullNameChange(e.target.value)
            }
          />
        </div>

        {/* PHONE */}

        <div className="checkout-field">
          <label htmlFor="phone">
            Phone
          </label>

          <input
            id="phone"
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) =>
              onPhoneChange(e.target.value)
            }
          />
        </div>

        {/* EMAIL */}

        <div className="checkout-field checkout-field-full">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              onEmailChange(e.target.value)
            }
          />

          <span className="checkout-field-hint">
            We'll use this to confirm your order.
          </span>
        </div>
      </div>
    </div>
  );
}

export default CustomerForm;