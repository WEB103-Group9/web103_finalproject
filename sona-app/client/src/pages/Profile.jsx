import { useEffect, useState } from "react";
import { getFollowing, updateUserPhoto } from "../api.js";
import currentUser from "../currentUser.js";
import ArtistCard from "../components/ArtistCard.jsx";
import { useOutletContext } from "react-router-dom";
import ImageUploader from "../components/ImageUploader.jsx";

export default function Profile() {
  const { user, setUser } = useOutletContext();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFollowing(currentUser.id)
      .then(setFollowing)
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoUploaded(url) {
    const updated = await updateUserPhoto(currentUser.id, url);
    setUser(updated);
  }

  return (
    <section>
      <h1>My Profile</h1>

      <div className="profile-header">
        {user?.photo && <img src={user.photo} alt="Profile" className="profile-avatar" />}
        <ImageUploader value={user?.photo} onUploaded={handlePhotoUploaded} />
      </div>

      <div className="tabs">
        <span className="tab active">Following</span>
        <span className="tab disabled">Order History</span>
      </div>

      {loading ? (
        <p>Loading your following list...</p>
      ) : following.length === 0 ? (
        <p>You're not following anyone yet.</p>
      ) : (
        <div className="grid">
          {following.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              initialFollowing={true}
              initialNotify={artist.notify_on_release}
              showQuickView={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
