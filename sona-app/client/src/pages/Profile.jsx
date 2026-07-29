import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  getFollowing,
  getUserOrders,
  getAdminOf,
  updateUserPhoto,
} from "../api.js";
import ArtistCard from "../components/ArtistCard.jsx";
import QuickViewPanel from "../components/QuickViewPanel.jsx";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Profile() {
  const { user, setUser, handleLogout } = useOutletContext();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [managedArtist, setManagedArtist] = useState(null);
  const [activeTab, setActiveTab] = useState("following");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    getFollowing(user.id)
      .then(setFollowing)
      .finally(() => setLoading(false));
    getUserOrders(user.id)
      .then(setOrders)
      .catch((error) => setOrdersError(error.message))
      .finally(() => setOrdersLoading(false));
    getAdminOf(user.id).then(setManagedArtist);
  }, [user.id]);

  async function handlePhotoUploaded(url) {
    await updateUserPhoto(user.id, url);
    setUser((prev) => ({ ...prev, photo: url }));
  }

  async function handleFileSelect(event) {
    console.log("file select fired", event.target.files);
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sona_app_unsigned");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      await handlePhotoUploaded(data.secure_url);
    } catch (err) {
      console.error("Upload failed", err);
    }
  }

  return (
    <section>
      <div className="profile-header">
        <div className="profile-title-row">
          <div className="profile-avatar-upload">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Profile"
                className="profile-avatar-bubble"
              />
            ) : (
              <div className="profile-avatar-bubble profile-avatar-placeholder">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="avatar-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              ✎
            </label>
          </div>
          <h1>My Profile</h1>
        </div>
        <div className="profile-header-right">
          {managedArtist && (
            <Link to={`/artists/${managedArtist.id}`} className="btn-outline">
              Manage My Artist Page
            </Link>
          )}
          {user?.spotify_connected ? (
            <span className="badge">Spotify Connected</span>
          ) : (
            <a
              href={`${BASE}/api/spotify/authorize?user_id=${user.id}`}
              className="btn"
            >
              Connect Spotify
            </a>
          )}
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          Following
          {following.length > 0 && (
            <span className="tab-count">{following.length}</span>
          )}
        </button>

        <button
          className={`profile-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Order History
          {orders.length > 0 && (
            <span className="tab-count">{orders.length}</span>
          )}
        </button>
      </div>

      {activeTab === "following" && (
        <>
          {loading ? (
            <p>Loading your following list...</p>
          ) : following.length === 0 ? (
            <p>You're not following anyone yet.</p>
          ) : (
            <div className="grid">
              {following.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onQuickView={() => setSelectedArtist(artist)}
                  initialFollowing={true}
                  initialNotify={artist.notify_on_release}
                />
              ))}
            </div>
          )}

          <QuickViewPanel
            artist={selectedArtist}
            onClose={() => setSelectedArtist(null)}
          />
        </>
      )}

      {activeTab === "orders" && (
        <>
          {ordersLoading ? (
            <p>Loading your order history...</p>
          ) : ordersError ? (
            <p>{ordersError}</p>
          ) : orders.length === 0 ? (
            <p>You have not placed any orders yet.</p>
          ) : (
            orders.map((order) => (
              <article className="card order-card" key={order.id}>
                <h2>Order #{order.id}</h2>

                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>

                <p>Total: ${Number(order.total).toFixed(2)}</p>

                <hr />

                {order.items.map((item) => (
                  <div key={item.id}>
                    <strong>{item.name}</strong>

                    <p>Quantity: {item.quantity}</p>

                    <p>Price: ${Number(item.price).toFixed(2)}</p>
                  </div>
                ))}
              </article>
            ))
          )}
        </>
      )}
    </section>
  );
}
