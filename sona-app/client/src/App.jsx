import { Link, Outlet } from "react-router-dom";
import logo from "./assets/sona-logo-tagline.svg";

function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">
          <img src={logo} alt="Sona" className="brand-logo" />
        </Link>
        <div className="nav-right">
          <Link to="/profile">Profile</Link>
          <span className="cart">🛒</span>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

export default App;
