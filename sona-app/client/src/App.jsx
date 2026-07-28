import { useMemo, useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/sona-logo-tagline.svg";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("sonaCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("sonaCart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/login/success`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { success: false }))
      .then((data) => {
        setUser(data.success ? data.user : null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user && location.pathname !== "/login") {
      navigate("/login");
    } else if (user && !user.onboarded && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    } else if (
      user &&
      user.onboarded &&
      (location.pathname === "/login" || location.pathname === "/onboarding")
    ) {
      navigate("/");
    }
  }, [user, loading, location.pathname, navigate]);

  async function handleLogout() {
    try {
      await fetch("http://`${import.meta.env.VITE_API_URL}/auth/logout", {
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      window.location.replace("/login");
    }
  }

  function addToCart(merch) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === merch.id);

      if (existingItem) {
        if (existingItem.quantity >= merch.stock) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === merch.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
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
      currentItems.filter((item) => item.id !== merchId),
    );
  }

  function updateCartQuantity(merchId, newQuantity) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== merchId) {
          return item;
        }

        const quantity = Math.max(1, Math.min(Number(newQuantity), item.stock));

        return {
          ...item,
          quantity,
        };
      }),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (totalQuantity, item) => totalQuantity + item.quantity,
        0,
      ),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
    [cartItems],
  );

  if (loading) return <p>Loading...</p>;

  if (location.pathname === "/login" || location.pathname === "/onboarding") {
    return <Outlet context={{ user }} />;
  }

  if (!user || !user.onboarded) {
    return null;
  }

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
            <Link to="/">Artists</Link>
            <Link to="/concerts">Concerts</Link>
            <Link to="/merch">Merch</Link>
            <Link to="/feed">My Feed</Link>
            <Link to="/cart" className="cart">
              🛒 {cartCount > 0 && <span>({cartCount})</span>}
            </Link>
            <Link to="/profile" className="nav-avatar-link">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={{ width: 32, height: 32, borderRadius: "50%" }}
                />
              ) : (
                "Profile"
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <Outlet
          context={{
            user,
            setUser,
            handleLogout,
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
