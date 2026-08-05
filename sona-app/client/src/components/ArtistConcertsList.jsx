import { useEffect, useState } from "react";
import { getArtistConcerts } from "../api.js";
import ConcertTable from "./ConcertTable.jsx";

export default function ArtistConcertsList({ artistId, isAdmin }) {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addRow, setAddRow] = useState(false);
  const [isFirstConcert, setIsFirstConcert] = useState(false);

  useEffect(() => {
    setLoading(true);
    getArtistConcerts(artistId)
      .then(setConcerts)
      .finally(() => setLoading(false));
  }, [artistId]);

  const handleAddRow = () => {
    if (concerts.length === 0) setIsFirstConcert(true);
    setAddRow(true);

    const newConcert = {
        artist_id: Number(artistId),
        venue: '',
        city: '',
        date: '',
        ticket_link: "",
        source: "manual"
    }
    setConcerts([...concerts, newConcert]);
  };

  return (
    <div className={isAdmin ? "detail-side concert-admin-view" : "detail-side"}>
      <div className="concerts-titlebar">
        <h2>Concerts</h2>
        {isAdmin && (
          <button className="btn" onClick={handleAddRow} disabled={addRow}>
            Add New Concert
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : isAdmin ? (
        <>
          {concerts.length === 0 && (
            <p className="placeholder">No upcoming concerts.</p>
          )}
          <ConcertTable
            artistId={artistId}
            isFirstConcert={isFirstConcert}
            setIsFirstConcert={setIsFirstConcert}
            concerts={concerts}
            setConcerts={setConcerts}
            addRow={addRow}
            setAddRow={setAddRow}
          />
        </>
      ) : concerts.length === 0 ? (
        <p className="placeholder">No upcoming concerts.</p>
      ) : (
        <div className="concerts-scroll">
          {concerts.map((concert) => (
            <div key={concert.concert_id} className="concert-row">
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
