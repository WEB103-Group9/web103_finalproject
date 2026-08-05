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
  deleteArtist,
  getPostsByArtist,
  getArtistMerch,
  getArtistConcerts,
} from "../api.js";
import EditArtistProfileForm from "../components/EditArtistProfileForm.jsx";
import ArtistConcertsList from "../components/ArtistConcertsList.jsx";
import CreateMerchForm from "../components/CreateMerchForm.jsx";
import CreatePostForm from "../components/CreatePostForm.jsx";
import FollowButton from "../components/FollowButton.jsx";
import ArtistAbout from "../components/ArtistAbout.jsx";
import ArtistPost from "../components/ArtistPost.jsx";
import MerchCard from "../components/MerchCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Toast from "../components/Toast.jsx";

export default function ArtistDetail() {
  const { user } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [following, setFollowing] = useState(null);
  const [notify, setNotify] = useState(false);
  const [editing, setEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("");
  const [merch, setMerch] = useState([]);
  const [merchLoading, setMerchLoading] = useState(true);
  const [showCreateMerch, setShowCreateMerch] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [concerts, setConcerts] = useState([]);
  const [concertsLoading, setConcertsLoading] = useState(true);

  let new_post = searchParams.get("new_post") === "true";

  useEffect(() => {
    getArtist(id).then((data) => {
      setArtist(data);
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

  if (!artist || following === null) return <Spinner />;

  async function handleDelete() {
    if (!confirm(`Delete ${artist.name}?`)) return;
    try {
      await deleteArtist(id, user.id);
      navigate("/");
    } catch (err) {
      alert("Failed to delete — you may need to log in again.");
    }
  }

  function showToast(message, type = "") {
    setToast(message);
    setToastType(type);
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
        <EditArtistProfileForm
          artist={artist}
          onSaved={(updated) => {
            setArtist(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="detail-grid">
        <ArtistAbout artist={artist} />
        <ArtistConcertsList artistId={id} isAdmin={isAdmin} />
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
          <CreatePostForm
            artistId={artist.id}
            onCreated={(newPost) => {
              setPosts((prev) => [newPost, ...prev]);
              setShowCreatePost(false);
              showToast("Post published");
            }}
            onCancel={() => setShowCreatePost(false)}
          />
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
                  showToast("Post deleted", "danger");
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
          <CreateMerchForm
            artistId={artist.id}
            onCreated={(created) => {
              setMerch((prev) => [created, ...prev]);
              setShowCreateMerch(false);
              showToast("Merch created!");
            }}
            onCancel={() => setShowCreateMerch(false)}
          />
        )}

        {merchLoading ? (
          <Spinner />
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
                    showToast("Merch deleted", "danger");
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
      <Toast message={toast} type={toastType} />
    </article>
  );
}
