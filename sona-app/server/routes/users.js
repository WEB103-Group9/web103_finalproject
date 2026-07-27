import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, username, role, photo FROM users WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET photo = COALESCE($2, photo) WHERE id = $1 RETURNING id, username, role, photo`,
      [id, photo],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.get("/:id/admin-of", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT artists.*
       FROM admin
       JOIN artists ON artists.id = admin.artist_id
       WHERE admin.user_id = $1`,
      [id],
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch admin-of" });
  }
});

router.get("/:id/following", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT artists.*,
              follows.notify_on_release,
              follows.created_at AS followed_at
       FROM follows
       JOIN artists ON artists.id = follows.artist_id
       WHERE follows.user_id = $1
       ORDER BY follows.created_at DESC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

export default router;
