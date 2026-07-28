import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getFeed } from "../api.js";

function FeedItem({ item }) {
  const { type, artist_id, artist_name, artist_photo, data, created_at } = item;

  return (
    <Link
      to={`/artists/${artist_id}`}
      className={`feed-card feed-card-${type}`}
    >
      <img src={artist_photo} alt={artist_name} className="feed-avatar" />
      <div className="feed-card-body">
        <div className="feed-card-top">
          <strong>{artist_name}</strong>
          <span className={`feed-badge feed-badge-${type}`}>{type}</span>
        </div>

        {type === "post" && <p>{data.content}</p>}

        {type === "concert" && (
          <p>
            📍 {data.venue}, {data.city} —{" "}
            {new Date(data.date).toLocaleDateString()}
          </p>
        )}

        {type === "merch" && (
          <p>
            🛍️ New drop: {data.name} — ${Number(data.price).toFixed(2)}
          </p>
        )}

        <time>{new Date(created_at).toLocaleDateString()}</time>
      </div>
    </Link>
  );
}

export default function Feed() {
  const { user } = useOutletContext();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFeed(user.id)
      .then(setFeed)
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <section>
      <div className="page-header">
        <h1>Your Feed</h1>
        <p className="page-subtitle">
          Everything from artists you follow, in one place.
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : feed.length === 0 ? (
        <div className="feed-empty">
          <p>🎵</p>
          <p>
            Nothing here yet — follow some artists to see their posts, shows,
            and merch drops.
          </p>
          <Link to="/" className="btn">
            Discover Artists
          </Link>
        </div>
      ) : (
        <div className="feed-list">
          {feed.map((item) => (
            <FeedItem key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
