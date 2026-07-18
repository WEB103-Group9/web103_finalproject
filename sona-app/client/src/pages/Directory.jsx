import { useEffect, useState } from "react";
import { getArtists } from "../api.js";
import ArtistCard from "../components/ArtistCard.jsx";

const GENRES = ["Pop", "Rock", "Hip-Hop"];

export default function Directory() {
  const [artists, setArtists] = useState([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArtists({ q, genre })
      .then(setArtists)
      .finally(() => setLoading(false));
  }, [q, genre]);

  return (
    <section>
      <h1>Discover Artists</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search Bar"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select value={genre} onChange={(event) => setGenre(event.target.value)}>
          <option value="">Genre Dropdown</option>
          {GENRES.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : artists.length === 0 ? (
        <p>No artists found.</p>
      ) : (
        <div className="grid">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </section>
  );
}
