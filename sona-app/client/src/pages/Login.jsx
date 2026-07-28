import logo from "../assets/sona-logo-tagline.svg";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Sona — Artist + Fan Hub" className="login-logo" />
        <p className="login-subtitle">
          Follow artists. Discover music. All in one place.
        </p>
        <a href="http://localhost:3001/auth/github" className="login-btn">
          Login with GitHub
        </a>
      </div>
    </div>
  );
}
