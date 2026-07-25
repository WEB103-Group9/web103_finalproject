import { useEffect, useState } from "react";
import { getFollowing, getUserOrders } from "../api.js";
import currentUser from "../currentUser.js";
import ArtistCard from "../components/ArtistCard.jsx";

export default function Profile() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("following");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");


  useEffect(() => {
    getFollowing(currentUser.id)
      .then(setFollowing)
      .finally(() => setLoading(false));

    getUserOrders(currentUser.id)
      .then(setOrders)
      .catch((error) => setOrdersError(error.message))
      .finally(() => setOrdersLoading(false));

  }, []);

  return (
    <section>
      <h1>My Profile</h1>

      <div className="tabs">
        <button
          className={activeTab === "following" ? "tab active" : "tab"}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>

        <button
          className={activeTab === "orders" ? "tab active" : "tab"}
          onClick={() => setActiveTab("orders")}
        >
          Order History
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
              initialFollowing={true}
              initialNotify={artist.notify_on_release}
              showQuickView={false}
            />
          ))}
        </div>
      )}
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

              <p>
                Date:{" "}
                {new Date(order.created_at).toLocaleDateString()}
              </p>

              <p>
                Total: ${Number(order.total).toFixed(2)}
              </p>

              <hr />

              {order.items.map((item) => (
                <div key={item.id}>
                  <strong>{item.name}</strong>

                  <p>Quantity: {item.quantity}</p>

                  <p>
                    Price: ${Number(item.price).toFixed(2)}
                  </p>
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
