import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed } from "../api.js";
import currentUser from "../currentUser.js";

function FeedItem({ item }) {
  const { type, artist_id, artist_name, data, created_at } = item;

  return (
    <Link to={`/artists/${artist_id}`} className="feed-item">
      <span className="feed-type">{type}</span>
      <strong>{artist_name}</strong>

      {type === "post" && <p>{data.content}</p>}

      {type === "concert" && (
        <p>{data.venue}, {data.city} — {new Date(data.date).toLocaleDateString()}</p>
      )}

      {type === "merch" && (
        <p>New drop: {data.name} — ${Number(data.price).toFixed(2)}</p>
      )}

      <time>{new Date(created_at).toLocaleDateString()}</time>
    </Link>
  );
}

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFeed(currentUser.id)
      .then(setFeed)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Your Feed</h1>

      {loading ? (
        <p>Loading...</p>
      ) : feed.length === 0 ? (
        <p>Follow some artists to see their posts, concerts, and merch drops here.</p>
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