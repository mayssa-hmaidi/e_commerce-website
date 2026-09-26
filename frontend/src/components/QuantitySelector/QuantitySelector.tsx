import "./QuantitySelector.css";

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
}: QuantitySelectorProps) {
  return (
    <div className="quantity-selector">
      <button onClick={onDecrease}>-</button>

      <span>{quantity}</span>

      <button onClick={onIncrease}>+</button>
    </div>
  );
}

export default QuantitySelector;
