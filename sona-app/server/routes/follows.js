import express from "express";
import pool from "../config/database.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const user_id = req.user.id;
  const { artist_id, notify_on_release = false } = req.body;

  if (!artist_id) {
    return res.status(400).json({ error: "artist_id is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO follows (user_id, artist_id, notify_on_release)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, artist_id)
       DO UPDATE SET notify_on_release = EXCLUDED.notify_on_release
       RETURNING *`,
      [user_id, artist_id, notify_on_release],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to follow artist" });
  }
});

router.delete("/:artistId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const user_id = req.user.id;
  const { artistId } = req.params;

  try {
    await pool.query(
      `DELETE FROM follows WHERE user_id = $1 AND artist_id = $2`,
      [user_id, artistId],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unfollow artist" });
  }
});

export default router;
