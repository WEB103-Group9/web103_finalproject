function Social({ label, value }) {
  if (!value) return null;
  return (
    <span className="social" title={value}>
      {label}
    </span>
  );
}

export default function ArtistAbout({ artist }) {
  return (
    <div className="detail-about">
      <h2>About</h2>
      <p>{artist.description || "No bio yet."}</p>

      <div className="social-row">
        <Social label="IG" value={artist.instagram} />
        <Social label="X" value={artist.twitter} />
        <Social label="FB" value={artist.facebook} />
        <Social label="TT" value={artist.tiktok} />
      </div>

      {artist.spotify ? (
        <a
          href={artist.spotify}
          target="_blank"
          rel="noreferrer"
          className="spotify-embed"
        >
          Open on Spotify
        </a>
      ) : (
        <div className="spotify-embed">Spotify Embed Placeholder</div>
      )}
    </div>
  );
}
