import { useEffect, useState } from "react";
import { getArtistConcerts } from "../api.js";

export default function ArtistConcertsList({ artistId }) {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArtistConcerts(artistId)
      .then(setConcerts)
      .finally(() => setLoading(false));
  }, [artistId]);

  return (
    <div className="detail-side">
      <h2>Concerts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : concerts.length === 0 ? (
        <p className="placeholder">No upcoming concerts.</p>
      ) : (
        <div className="concerts-scroll">
          {concerts.map((concert) => (
            <div key={concert.id} className="concert-row">
              <div className="concert-row-info">
                <strong>{concert.venue}</strong>
                <span className="concert-row-city">{concert.city}</span>
                <span className="concert-row-date">
                  {new Date(concert.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <a
                href={concert.ticket_link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
              >
                Get Tickets
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
