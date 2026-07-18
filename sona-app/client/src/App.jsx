import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">Sona</Link>
        <span className="cart">🛒</span>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

export default App;
