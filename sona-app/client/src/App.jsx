import { Link, Outlet } from "react-router-dom";
import logo from "./assets/sona-logo-tagline.svg";
import { useEffect, useState } from "react";
import { getUser } from "./api";
import currentUser from "./currentUser";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser(currentUser.id).then(setUser);
  }, []);

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
            <Link to="/profile">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="nav-avatar" />
              ) : (
                "Profile"
              )}
            </Link>
            <span className="cart">🛒</span>
          </div>
        </div>
      </nav>
      <main className="container">
        <Outlet context={{ user, setUser }} />
      </main>
    </>
  );
}

export default App;
