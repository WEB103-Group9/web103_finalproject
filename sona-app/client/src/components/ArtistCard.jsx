import { Link } from "react-router-dom";
import FollowButton from "./FollowButton.jsx";

export default function ArtistCard({
  artist,
  initialFollowing = false,
  initialNotify = false,
  showQuickView = true,
}) {
  return (
    <div className="card">
      <Link to={`/artists/${artist.id}`} className="card-link">
        <img src={artist.photo} alt={artist.name} className="card-photo" />
      </Link>

      <div className="name-bar">{artist.name}</div>
      {artist.genre && <span className="genre-tag">{artist.genre}</span>}

      <div className="card-actions">
        {showQuickView && (
          <button type="button" className="btn-outline" disabled>
            Quick View
          </button>
        )}
        <FollowButton
          artistId={artist.id}
          initialFollowing={initialFollowing}
          initialNotify={initialNotify}
        />
      </div>
    </div>
  );
}
