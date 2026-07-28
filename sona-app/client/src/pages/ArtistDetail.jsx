import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useOutletContext,
  Link,
} from "react-router-dom";
import {
  getArtist,
  getAdminOf,
  getFollowing,
  updateArtist,
  deleteArtist,
  getPostsByArtist,
  createPost,
  getArtistMerch,
  createMerch,
  getArtistConcerts,
} from "../api.js";
import ImageUploader from "../components/ImageUploader.jsx";
import FollowButton from "../components/FollowButton.jsx";
import ArtistPost from "../components/ArtistPost.jsx";
import MerchCard from "../components/MerchCard.jsx";
import Toast from "../components/Toast.jsx";

function Social({ label, value }) {
  if (!value) return null;
  return (
    <span className="social" title={value}>
      {label}
    </span>
  );
}

const EDITABLE = [
  { key: "name", label: "Name" },
  { key: "genre", label: "Genre" },
  { key: "photo", label: "Photo", image: true },
  { key: "description", label: "Bio", textarea: true },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "spotify", label: "Spotify URL" },
];

export default function ArtistDetail() {
  const { user } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [following, setFollowing] = useState(null);
  const [notify, setNotify] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState("");
  const [merch, setMerch] = useState([]);
  const [merchLoading, setMerchLoading] = useState(true);
  const [showCreateMerch, setShowCreateMerch] = useState(false);
  const [merchForm, setMerchForm] = useState({
    name: "",
    type: "",
    price: "",
    stock: "",
    photo: "",
  });
  const [merchError, setMerchError] = useState("");
  const [merchSubmitting, setMerchSubmitting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postError, setPostError] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [concerts, setConcerts] = useState([]);
  const [concertsLoading, setConcertsLoading] = useState(true);

  let new_post = searchParams.get("new_post") === "true";

  useEffect(() => {
    getArtist(id).then((data) => {
      setArtist(data);
      const seeded = {};
      for (const { key } of EDITABLE) seeded[key] = data[key] ?? "";
      setForm(seeded);
    });
    getAdminOf(user.id).then((administered) => {
      setIsAdmin(administered?.id === Number(id));
    });
    getFollowing(user.id).then((rows) => {
      const match = rows.find((row) => row.id === Number(id));
      setFollowing(Boolean(match));
      setNotify(match?.notify_on_release ?? false);
    });
  }, [id, user.id]);

  useEffect(() => {
    getPostsByArtist(id).then(setPosts);
    setMerchLoading(true);
    getArtistMerch(id)
      .then(setMerch)
      .finally(() => setMerchLoading(false));
    setConcertsLoading(true);
    getArtistConcerts(id)
      .then(setConcerts)
      .finally(() => setConcertsLoading(false));
  }, [id]);

  useEffect(() => {
    if (new_post) {
      showToast("Post published");
      const params = new URLSearchParams(searchParams);
      params.delete("new_post");
      setSearchParams(params, { replace: true });
    }
  }, [new_post, searchParams, setSearchParams]);

  if (!artist || following === null) return <p>Loading...</p>;

  async function handleSave(event) {
    event.preventDefault();
    const updated = await updateArtist(id, {
      ...form,
      user_id: user.id,
    });
    setArtist((prev) => ({ ...prev, ...updated, ...form }));
    setEditing(false);
  }

  async function handleCreatePost(event) {
    event.preventDefault();
    if (!postContent.trim()) {
      setPostError("Post can't be empty.");
      return;
    }
    setPostError("");
    setPostSubmitting(true);
    try {
      const newPost = await createPost(user.id, artist.id, postContent);
      setPosts((prev) => [
        { ...newPost, posted_on: newPost.created_at },
        ...prev,
      ]);
      setPostContent("");
      setShowCreatePost(false);
      showToast("Post published");
    } catch (err) {
      setPostError("Something went wrong.");
    } finally {
      setPostSubmitting(false);
    }
  }

  async function handleCreateMerch(event) {
    event.preventDefault();
    setMerchError("");
    setMerchSubmitting(true);
    try {
      const created = await createMerch(artist.id, {
        ...merchForm,
        price: Number(merchForm.price),
        stock: Number(merchForm.stock) || 0,
        user_id: user.id,
      });
      setMerch((prev) => [created, ...prev]);
      setMerchForm({ name: "", type: "", price: "", stock: "", photo: "" });
      setShowCreateMerch(false);
      setToast("Merch created!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setMerchError("Failed to create merch.");
    } finally {
      setMerchSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${artist.name}?`)) return;
    try {
      await deleteArtist(id, user.id);
      navigate("/");
    } catch (err) {
      alert("Failed to delete — you may need to log in again.");
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <article>
      <div className="detail-hero">
        <img src={artist.photo} alt={artist.name} className="detail-hero-img" />
      </div>

      <div className="detail-titlebar">
        <div>
          <h1>{artist.name}</h1>
          {artist.genre && <span className="genre-tag">{artist.genre}</span>}
        </div>

        <div className="titlebar-actions">
          {!isAdmin && (
            <FollowButton
              artistId={artist.id}
              initialFollowing={following}
              initialNotify={notify}
            />
          )}
          {isAdmin && !editing && (
            <div className="admin-controls">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isAdmin && editing && (
        <form onSubmit={handleSave} className="edit-form">
          {EDITABLE.map(({ key, label, textarea, image }) =>
            image ? (
              <ImageUploader
                key={key}
                value={form[key]}
                onUploaded={(url) => setForm({ ...form, [key]: url })}
              />
            ) : textarea ? (
              <textarea
                key={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
              />
            ) : (
              <input
                key={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
              />
            ),
          )}
          <div className="admin-controls">
            <button type="submit" className="btn">
              Save
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="detail-grid">
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

        <div className="detail-side">
          <h2>Concerts</h2>
          {concertsLoading ? (
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
      </div>

      <section>
        <div className="posts-titlebar">
          <h2>Posts</h2>
          {isAdmin && !showCreatePost && (
            <button className="btn" onClick={() => setShowCreatePost(true)}>
              Add New Post
            </button>
          )}
        </div>

        {isAdmin && showCreatePost && (
          <form onSubmit={handleCreatePost} className="edit-form">
            <textarea
              placeholder="Text for new post"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              autoFocus
            ></textarea>
            {postError && <p className="onboarding-error">{postError}</p>}
            <div className="admin-controls">
              <button type="submit" className="btn" disabled={postSubmitting}>
                {postSubmitting ? "Posting..." : "Post"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowCreatePost(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <ArtistPost
                key={post.id}
                postDetails={post}
                isAdmin={isAdmin}
                onUpdated={(updated) => {
                  setPosts((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p)),
                  );
                  showToast("Post updated");
                }}
                onDeleted={(deletedId) => {
                  setPosts((prev) => prev.filter((p) => p.id !== deletedId));
                  showToast("Post deleted");
                }}
              />
            ))
          ) : (
            <p className="placeholder">No posts yet.</p>
          )}
        </div>
      </section>

      <section className="merch-strip">
        <div className="merch-head">
          <h2>Merch</h2>
          {isAdmin && !showCreateMerch && (
            <button
              type="button"
              className="btn"
              onClick={() => setShowCreateMerch(true)}
            >
              Add New Merch
            </button>
          )}
        </div>

        {isAdmin && showCreateMerch && (
          <form onSubmit={handleCreateMerch} className="edit-form">
            <input
              placeholder="Name"
              value={merchForm.name}
              onChange={(e) =>
                setMerchForm({ ...merchForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Type"
              value={merchForm.type}
              onChange={(e) =>
                setMerchForm({ ...merchForm, type: e.target.value })
              }
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={merchForm.price}
              onChange={(e) =>
                setMerchForm({ ...merchForm, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={merchForm.stock}
              onChange={(e) =>
                setMerchForm({ ...merchForm, stock: e.target.value })
              }
            />
            <ImageUploader
              value={merchForm.photo}
              onUploaded={(url) => setMerchForm({ ...merchForm, photo: url })}
            />
            {merchError && <p className="onboarding-error">{merchError}</p>}
            <div className="admin-controls">
              <button type="submit" className="btn" disabled={merchSubmitting}>
                {merchSubmitting ? "Creating..." : "Create Merch"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setShowCreateMerch(false);
                  setMerchForm({
                    name: "",
                    type: "",
                    price: "",
                    stock: "",
                    photo: "",
                  });
                  setMerchError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {merchLoading ? (
          <p>Loading...</p>
        ) : merch.length === 0 ? (
          <p className="placeholder">No merch yet.</p>
        ) : (
          <>
            <div className="grid">
              {merch.map((item) => (
                <MerchCard
                  key={item.id}
                  merch={item}
                  isAdmin={isAdmin}
                  onUpdated={(updated) => {
                    setMerch((prev) =>
                      prev.map((m) => (m.id === updated.id ? updated : m)),
                    );
                    setToast("Merch updated!");
                    setTimeout(() => setToast(""), 3000);
                  }}
                  onDeleted={(deletedId) => {
                    setMerch((prev) => prev.filter((m) => m.id !== deletedId));
                  }}
                />
              ))}
            </div>
            <div className="merch-see-all">
              <Link to="/merch">See All →</Link>
            </div>
          </>
        )}
      </section>

      {toast && <span className="toast">{toast}</span>}
    </article>
  );
}
