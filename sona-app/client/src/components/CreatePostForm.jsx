import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createPost } from "../api.js";

export default function CreatePostForm({ artistId, onCreated, onCancel }) {
  const { user } = useOutletContext();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) {
      setError("Post can't be empty.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const newPost = await createPost(user.id, artistId, content);
      onCreated({ ...newPost, posted_on: newPost.created_at });
      setContent("");
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <textarea
        placeholder="Text for new post"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
      ></textarea>
      {error && <p className="onboarding-error">{error}</p>}
      <div className="admin-controls">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Posting..." : "Post"}
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
