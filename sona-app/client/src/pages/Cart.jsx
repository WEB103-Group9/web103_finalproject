import { Link, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { createOrder } from "../api.js";
import Toast from "../components/Toast.jsx";

export default function Cart() {
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
  } = useOutletContext();

  function showToast(message, type = "") {
    setToast(message);
    setToastType(type);
    setTimeout(() => setToast(""), 2000);
  }

  if (successMessage) {
    return (
      <section>
        <h1>Order Confirmation</h1>
        <p className="success-message">{successMessage}</p>
        <Link to="/merch">Continue Shopping</Link>
        <Toast message={toast} type={toastType} />
        {showConfetti && (
          <div className="confetti-container">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: [
                    "#ffb3ba",
                    "#ffdfba",
                    "#ffffba",
                    "#baffc9",
                    "#bae1ff",
                    "#d7baff",
                  ][i % 6],
                }}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section>
        <h1>Shopping Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/merch">Continue Shopping</Link>
      </section>
    );
  }

  async function handlePlaceOrder() {
    if (cartItems.length === 0 || orderSubmitted) {
      return;
    }
    setOrderSubmitted(true);
    setPlacingOrder(true);
    setSuccessMessage("Your order was placed successfully.");
    showToast("Order placed!");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    clearCart();
    setErrorMessage("");

    const orderData = {
      items: cartItems.map((item) => ({
        merch_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      // Custom feature: one Place Order action automatically creates
      // the order and all related order_items database records.
      await createOrder(orderData);

      setSuccessMessage("Your order was placed successfully.");
      showToast("Order placed!");
      clearCart();
    } catch (error) {
      setErrorMessage(error.message);
      showToast("Order failed", "danger");
      setOrderSubmitted(false);
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <section>
      <h1>Shopping Cart</h1>

      <div className="cart-items">
        {cartItems.map((item) => {
          const itemSubtotal = Number(item.price) * item.quantity;

          return (
            <div className="card cart-item" key={item.id}>
              <img src={item.photo} alt={item.name} className="card-photo" />

              <div className="cart-item-details">
                <h2>{item.name}</h2>

                <p>Price: ${Number(item.price).toFixed(2)}</p>

                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      updateCartQuantity(item.id, event.target.value)
                    }
                  />
                </label>

                <p>Available stock: {item.stock}</p>

                <p>Subtotal: ${itemSubtotal.toFixed(2)}</p>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <h2>Total: ${cartTotal.toFixed(2)}</h2>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0 || placingOrder || orderSubmitted}
        >
          {placingOrder
            ? "Placing Order..."
            : orderSubmitted
              ? "Order Placed"
              : "Place Order"}
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </section>
  );
}
