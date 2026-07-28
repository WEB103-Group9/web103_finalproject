import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { updateArtist } from "../api.js";
import ImageUploader from "./ImageUploader.jsx";

const EDITABLE = [
  { key: "name", label: "Name" },
  { key: "genre", label: "Genre" },
  { key: "description", label: "Bio", textarea: true },
  { key: "instagram", label: "Instagram" },
  { key: "twitter", label: "Twitter" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "spotify", label: "Spotify URL" },
];

export default function EditArtistProfileForm({ artist, onSaved, onCancel }) {
  const { user } = useOutletContext();
  const [form, setForm] = useState(() => {
    const seeded = {};
    for (const { key } of EDITABLE) seeded[key] = artist[key] ?? "";
    return seeded;
  });

  async function handleSave(event) {
    event.preventDefault();
    const updated = await updateArtist(artist.id, {
      ...form,
      user_id: user.id,
    });
    onSaved({ ...artist, ...updated, ...form });
  }

  return (
    <form onSubmit={handleSave} className="edit-form">
      {EDITABLE.map(({ key, label, textarea }) =>
        textarea ? (
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
      <ImageUploader
        value={form.photo}
        onUploaded={(url) => setForm({ ...form, photo: url })}
      />
      <div className="admin-controls">
        <button type="submit" className="btn">
          Save
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
