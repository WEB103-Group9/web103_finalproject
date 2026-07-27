import { useMemo,useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import logo from "./assets/sona-logo-tagline.svg";

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("sonaCart")

    return savedCart ? JSON.parse(savedCart): []
  })

  useEffect(() => {
    localStorage.setItem("sonaCart", JSON.stringify(cartItems))
  }, [cartItems])

  function addToCart(merch) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === merch.id
      );

      if (existingItem) {
        // Do not allow the cart quantity to exceed available stock.
        if (existingItem.quantity >= merch.stock) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === merch.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      if (merch.stock <= 0) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          ...merch,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(merchId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== merchId)
    );
  }

  function updateCartQuantity(merchId, newQuantity) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== merchId) {
          return item;
        }

        const quantity = Math.max(
          1,
          Math.min(Number(newQuantity), item.stock)
        );

        return {
          ...item,
          quantity,
        };
      })
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (totalQuantity, item) => totalQuantity + item.quantity,
        0
      ),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <img
              src={logo}
              alt="Sona — Artist + Fan Hub"
              className="brand-logo"
            />
          </Link>

          <div className="nav-right">
            <Link to="/profile">Profile</Link>
            <Link to="/merch">Merch</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/cart" className="cart">
              🛒 {cartCount > 0 && <span>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet
          context={{
            cartItems,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            cartTotal,
          }}
        />
      </main>
    </>
  );
}

export default App;

