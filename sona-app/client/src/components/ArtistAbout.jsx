function getSpotifyEmbedUrl(spotifyUrl) {
  if (!spotifyUrl) return null;
  try {
    const url = new URL(spotifyUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;
    const [type, id] = pathParts;
    if (!["artist", "track", "album", "playlist"].includes(type)) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
}

function Social({ label, value }) {
  if (!value) return null;
  return (
    <span className="social" title={value}>
      {label}
    </span>
  );
}

export default function ArtistAbout({ artist }) {
  const embedUrl = getSpotifyEmbedUrl(artist.spotify);

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

      {embedUrl ? (
        <iframe
          className="spotify-embed"
          src={embedUrl}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      ) : (
        <div className="spotify-embed">Spotify Embed Placeholder</div>
      )}
    </div>
  );
}
