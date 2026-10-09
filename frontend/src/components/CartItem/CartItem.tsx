import type { CartItem as CartItemType } from "../../types/cart";
import { useCart } from "../../context/CartContext";

import QuantitySelector from "../QuantitySelector/QuantitySelector";

import "./CartItem.css";

type CartItemProps = {
  item: CartItemType;
};

function CartItem({ item }: CartItemProps) {
  const { removeFromCart, increaseQuantity, decreaseQuantity } = useCart();

  const itemTotal = item.price * item.quantity;

  return (
    <article className="cart-item">
      {/* PRODUCT */}

      <div className="cart-item-product">
        <img
          src={item.image}
          alt={item.name}
          className="cart-item-image"
          width={72}
          height={88}
        />

        <div className="cart-item-details">
          <h3>{item.name}</h3>

          <p>Color: {item.color}</p>

          <p>Size: {item.size}</p>
        </div>
      </div>

      {/* PRICE */}

      <div className="cart-item-price">{item.price.toFixed(1)} DT</div>

      {/* QUANTITY */}

      <div className="cart-item-quantity">
        <QuantitySelector
          quantity={item.quantity}
          onIncrease={() =>
            increaseQuantity(item.productId, item.color, item.size)
          }
          onDecrease={() =>
            decreaseQuantity(item.productId, item.color, item.size)
          }
        />
      </div>

      {/* TOTAL */}

      <div className="cart-item-total">
        <span>{itemTotal.toFixed(1)} DT</span>

        <button
          type="button"
          className="cart-item-remove"
          onClick={() => removeFromCart(item.productId, item.color, item.size)}
          aria-label={`Remove ${item.name} from cart`}
        >
          <i className="bi bi-trash3"></i>
        </button>
      </div>
    </article>
  );
}

export default CartItem;
