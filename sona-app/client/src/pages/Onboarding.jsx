import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("${import.meta.env.VITE_API_URL}/auth/login/success", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.success ? data.user : null));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role, artistName, genre }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await res.json();
      if (data.artistId) {
        window.location.href = `/artists/${data.artistId}`;
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {currentUser && (
        <div className="onboarding-account-badge">
          <img
            src={currentUser.avatar_url}
            alt={currentUser.username}
            className="onboarding-avatar"
          />
          <a
            href="${import.meta.env.VITE_API_URL}/auth/logout"
            className="onboarding-logout-link"
          >
            Not {currentUser.username}? Logout
          </a>
        </div>
      )}
      <div className="onboarding-split">
        <h1 className="onboarding-title">Welcome to Sona</h1>
        <form onSubmit={handleSubmit} className="onboarding-form">
          <label className={`role-option ${role === "fan" ? "selected" : ""}`}>
            <input
              type="radio"
              name="role"
              value="fan"
              checked={role === "fan"}
              onChange={(e) => setRole(e.target.value)}
            />
            FAN ACCOUNT <br /> follow the artists you love
          </label>

          <label
            className={`role-option ${role === "artist" ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="role"
              value="artist"
              checked={role === "artist"}
              onChange={(e) => setRole(e.target.value)}
            />
            ARTIST ACCOUNT <br /> share your music with fans
          </label>

          {role === "artist" && (
            <div className="onboarding-artist-fields">
              <input
                type="text"
                placeholder="Artist or band name"
                className="onboarding-input"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Genre (optional)"
                className="onboarding-input"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
          )}

          {error && <p className="onboarding-error">{error}</p>}

          <button
            type="submit"
            className="onboarding-submit"
            disabled={!role || submitting}
          >
            {submitting ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
