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

export default function QuickViewPanel({ artist, onClose }) {
  if (!artist) return null;

  const embedUrl = getSpotifyEmbedUrl(artist.spotify);

  return (
    <>
      <div className="qv-overlay" onClick={onClose} />
      <div className="qv-panel">
        <button className="qv-close" onClick={onClose}>
          ✕
        </button>
        <img src={artist.photo} alt={artist.name} className="qv-image" />

        <h2 className="qv-name">{artist.name}</h2>
        <span className="qv-genre">{artist.genre}</span>
        <p className="qv-bio">{artist.description}</p>

        <div className="qv-socials">
          {artist.instagram && (
            <a href={artist.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
          {artist.twitter && (
            <a href={artist.twitter} target="_blank" rel="noreferrer">
              X
            </a>
          )}
          {artist.facebook && (
            <a href={artist.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          )}
          {artist.tiktok && (
            <a href={artist.tiktok} target="_blank" rel="noreferrer">
              TikTok
            </a>
          )}
        </div>

        {embedUrl && (
          <iframe
            className="qv-spotify"
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        )}

        <a href={`/artists/${artist.id}`} className="qv-full-profile">
          View Full Profile
        </a>
      </div>
    </>
  );
}
