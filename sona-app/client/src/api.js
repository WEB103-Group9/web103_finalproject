const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const getArtists = ({ q = "", genre = "" } = {}) => {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);
  const qs = params.toString();
  return request(`/artists${qs ? `?${qs}` : ""}`);
};

export const getArtist = (id) => request(`/artists/${id}`);

export const updateArtist = (id, data) =>
  request(`/artists/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteArtist = (id, userId) =>
  request(`/artists/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ user_id: userId }),
  });

export const getAdminOf = (userId) => request(`/users/${userId}/admin-of`);
