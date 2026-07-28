import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createMerch } from "../api.js";
import ImageUploader from "./ImageUploader.jsx";

export default function CreateMerchForm({ artistId, onCreated, onCancel }) {
  const { user } = useOutletContext();
  const [form, setForm] = useState({
    name: "",
    type: "",
    price: "",
    stock: "",
    photo: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await createMerch(artistId, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        user_id: user.id,
      });
      onCreated(created);
      setForm({ name: "", type: "", price: "", stock: "", photo: "" });
    } catch (err) {
      setError("Failed to create merch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder="Type"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Stock"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />
      <ImageUploader
        value={form.photo}
        onUploaded={(url) => setForm({ ...form, photo: url })}
      />
      {error && <p className="onboarding-error">{error}</p>}
      <div className="admin-controls">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Creating..." : "Create Merch"}
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
