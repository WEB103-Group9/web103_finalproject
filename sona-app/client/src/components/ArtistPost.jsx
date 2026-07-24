import { Link } from "react-router-dom";

export default function ArtistPost({ postDetails, isAdmin }) {
  const pubDate = new Date(postDetails.posted_on);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
    pubDate,
  );

  return (
    <div className="card post">
      <p className="post-date">{formattedDate}</p>
      <p>{postDetails.content}</p>
      {isAdmin && (
        <Link
          role="button"
          className="btn"
          to={`/posts/edit/${postDetails.id}`}
        >
          Edit
        </Link>
      )}
    </div>
  );
}
