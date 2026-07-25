import { Link, useOutletContext } from "react-router-dom";
import { useState } from "react"
import { createOrder } from "../api.js"
import currentUser from "../currentUser.js"

export default function Cart() {
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
  } = useOutletContext();

  if (successMessage) {
    return (
        <section>
        <h1>Order Confirmation</h1>
        <p className="success-message">{successMessage}</p>
        <Link to="/merch">Continue Shopping</Link>
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
    setSuccessMessage("");
    setErrorMessage("");

    const orderData = {
        user_id: currentUser.id,
        items: cartItems.map((item) => ({
        merch_id: item.id,
        quantity: item.quantity,
        })),
    };

    try {
        
        await createOrder(orderData);

        setSuccessMessage("Your order was placed successfully.");
        clearCart();
    } catch (error) {
        setErrorMessage(error.message);
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
          const itemSubtotal =
            Number(item.price) * item.quantity;

          return (
            <div className="card cart-item" key={item.id}>
              <img
                src={item.photo}
                alt={item.name}
                className="card-photo"
              />

              <div className="cart-item-details">
                <h2>{item.name}</h2>

                <p>
                  Price: ${Number(item.price).toFixed(2)}
                </p>

                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      updateCartQuantity(
                        item.id,
                        event.target.value
                      )
                    }
                  />
                </label>

                <p>
                  Available stock: {item.stock}
                </p>

                <p>
                  Subtotal: ${itemSubtotal.toFixed(2)}
                </p>

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
            disabled={
                cartItems.length === 0 ||
                placingOrder ||
                orderSubmitted
            }
            >
            {placingOrder
                ? "Placing Order..."
                : orderSubmitted
                ? "Order Placed"
                : "Place Order"}
        </button>

        {errorMessage &&(
            <p className="error-message">{errorMessage}</p>
        )}

      </div>
    </section>
  );
}
