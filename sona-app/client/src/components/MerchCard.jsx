import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { deleteMerch, updateMerch } from "../api.js";
import ImageUploader from "./ImageUploader.jsx";

export default function MerchCard({
  merch,
  isAdmin,
  onUpdated,
  onDeleted,
  addToCart,
}) {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: merch.name,
    price: merch.price,
    stock: merch.stock,
    photo: merch.photo || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOutOfStock = Number(merch.stock) <= 0;

  async function handleDelete() {
    if (!confirm(`Delete ${merch.name}?`)) return;
    await deleteMerch(merch.id, user.id);
    onDeleted(merch.id);
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const updated = await updateMerch(merch.id, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        user_id: user.id,
      });
      onUpdated({ ...merch, ...updated });
      setEditing(false);
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setForm({
      name: merch.name,
      type: merch.type,
      price: merch.price,
      stock: merch.stock,
      photo: merch.photo || "",
    });
    setError("");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card card-merch">
        <div className="card-body">
          <form onSubmit={handleSave} className="edit-form">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
            />
            <input
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              placeholder="Type"
            />
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
            />
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="Stock"
            />
            <ImageUploader
              value={form.photo}
              onUploaded={(url) => setForm({ ...form, photo: url })}
            />
            {error && <p className="onboarding-error">{error}</p>}
            <div className="admin-controls">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-merch">
      <img src={merch.photo} alt={merch.name} className="card-photo" />
      <div className="card-body">
        <div className="name-bar">{merch.name}</div>
        <span className="genre-tag">{merch.type}</span>

        <div className="card-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => addToCart(merch)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
          <span className="price-tag">${Number(merch.price).toFixed(2)}</span>
        </div>

        {isAdmin && (
          <div className="admin-controls">
            <button
              type="button"
              className="btn"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
