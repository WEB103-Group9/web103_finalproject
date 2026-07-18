import { Link } from "react-router-dom";

export default function ArtistCard({ artist }) {
  return (
    <div className="card">
      <Link to={`/artists/${artist.id}`} className="card-link">
        <img src={artist.photo} alt={artist.name} className="card-photo" />
      </Link>

      <div className="name-bar">{artist.name}</div>
      {artist.genre && <span className="genre-tag">{artist.genre}</span>}

      <div className="card-actions">
        <button type="button" className="btn-outline" disabled>
          Quick View
        </button>
      </div>
    </div>
  );
}
