import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { followArtist, unfollowArtist } from "../api.js";

export default function FollowButton({
  artistId,
  initialFollowing,
  initialNotify,
}) {
  const { user } = useOutletContext();
  const [following, setFollowing] = useState(initialFollowing);
  const [notify, setNotify] = useState(initialNotify);
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  }

  async function toggleFollow() {
    try {
      if (following) {
        await unfollowArtist(user.id, artistId);
        setFollowing(false);
        setNotify(false);
        showToast("Unfollowed");
      } else {
        await followArtist(user.id, artistId, notify);
        setFollowing(true);
        showToast("Following");
      }
    } catch {
      showToast("Something went wrong");
    }
  }

  async function toggleNotify(event) {
    const next = event.target.checked;
    setNotify(next);
    if (following) await followArtist(user.id, artistId, next);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleFollow}
        className={following ? "btn-unfollow" : "btn-follow"}
      >
        {following ? "Unfollow" : "Follow"}
      </button>

      {following && (
        <label className="notify">
          <input type="checkbox" checked={notify} onChange={toggleNotify} />
          Notify me on release
        </label>
      )}

      {toast && <span className="toast">{toast}</span>}
    </>
  );
}
