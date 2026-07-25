import { Link, useOutletContext } from "react-router-dom";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
  } = useOutletContext();

  if (cartItems.length === 0) {
    return (
      <section>
        <h1>Shopping Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/merch">Continue Shopping</Link>
      </section>
    );
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

        <button type="button">
          Place Order
        </button>
      </div>
    </section>
  );
}
