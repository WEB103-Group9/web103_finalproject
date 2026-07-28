import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { deletePost, updatePost } from "../api.js";

export default function ArtistPost({
  postDetails,
  isAdmin,
  onUpdated,
  onDeleted,
}) {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(postDetails.content);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pubDate = new Date(postDetails.posted_on);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
    pubDate,
  );

  async function handleDelete() {
    if (!confirm(`Delete post?`)) return;
    await deletePost(postDetails.id, user.id, postDetails.artist_id);
    onDeleted(postDetails.id);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!content.trim()) {
      setError("Post can't be empty.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const updated = await updatePost(
        postDetails.id,
        user.id,
        postDetails.artist_id,
        content,
      );
      onUpdated({ ...postDetails, ...updated });
      setEditing(false);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (editing) {
    return (
      <div className="card post">
        <form onSubmit={handleSave} className="edit-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          ></textarea>
          {error && <p className="onboarding-error">{error}</p>}
          <div className="admin-controls">
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditing(false);
                setContent(postDetails.content);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card post">
      <p className="post-date">{formattedDate}</p>
      <p>{postDetails.content}</p>
      {isAdmin && (
        <div className="admin-controls">
          <button
            type="button"
            className="btn"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button className="btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
