import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getConcerts } from "../api.js";
import Spinner from "../components/Spinner.jsx";

export default function Concerts() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    setLoading(true);
    getConcerts()
      .then(setConcerts)
      .finally(() => setLoading(false));
  }, []);

  const cityOptions = useMemo(() => {
    const unique = [...new Set(concerts.map((c) => c.city).filter(Boolean))];
    return unique.sort();
  }, [concerts]);

  const [searchQuery, setSearchQuery] = useState("");

  // update the filtering:
  const matchesSearch = (c) =>
    !searchQuery ||
    c.artist_name?.toLowerCase().includes(searchQuery.toLowerCase());

  const featured = selectedCity
    ? concerts.filter((c) => c.city === selectedCity && matchesSearch(c))
    : [];
  const rest = (
    selectedCity ? concerts.filter((c) => c.city !== selectedCity) : concerts
  ).filter(matchesSearch);

  return (
    <section>
      <h1>Experience Concerts</h1>

      <div className="filters">
        {" "}
        <input
          type="search"
          placeholder="Search by artist"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Choose a city...</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : concerts.length === 0 ? (
        <p>No upcoming concerts found.</p>
      ) : (
        <>
          {selectedCity && featured.length > 0 && (
            <div className="concerts-featured">
              <h2>Shows in {selectedCity}</h2>
              <div className="concerts-featured-list">
                {featured.map((concert) => (
                  <div key={concert.id} className="concert-featured-item">
                    <img
                      src={concert.artist_photo}
                      alt={concert.artist_name}
                      className="concert-featured-photo"
                    />
                    <div>
                      <Link to={`/artists/${concert.artist_id}`}>
                        <strong>{concert.artist_name}</strong>
                      </Link>
                      <p>{concert.venue}</p>
                      <p>{new Date(concert.date).toLocaleDateString()}</p>
                      <a
                        href={concert.ticket_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                      >
                        Get Tickets
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid">
            {rest.map((concert) => (
              <div key={concert.id} className="card concert-card">
                <Link to={`/artists/${concert.artist_id}`}>
                  <img
                    src={concert.artist_photo}
                    alt={concert.artist_name}
                    className="card-photo"
                  />
                  <strong>{concert.artist_name}</strong>
                </Link>
                <p>
                  {concert.venue}, {concert.city}
                </p>
                <p>{new Date(concert.date).toLocaleDateString()}</p>
                <a
                  href={concert.ticket_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                >
                  Get Tickets
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
