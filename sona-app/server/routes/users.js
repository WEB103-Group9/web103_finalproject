import express from "express";
import pool from "../config/database.js";

const router = express.Router();

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

router.get("/:id/feed", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 'post' AS type, posts.id, posts.artist_id, artists.name AS artist_name,
              posts.created_at,
              json_build_object('content', posts.content) AS data
       FROM posts
       JOIN artists ON artists.id = posts.artist_id
       JOIN follows ON follows.artist_id = posts.artist_id
       WHERE follows.user_id = $1

       UNION ALL

       SELECT 'concert' AS type, concerts.id, concerts.artist_id, artists.name AS artist_name,
              concerts.created_at,
              json_build_object(
                'venue', concerts.venue,
                'city', concerts.city,
                'date', concerts.date,
                'ticket_link', concerts.ticket_link
              ) AS data
       FROM concerts
       JOIN artists ON artists.id = concerts.artist_id
       JOIN follows ON follows.artist_id = concerts.artist_id
       WHERE follows.user_id = $1

       UNION ALL

       SELECT 'merch' AS type, merch.id, merch.artist_id, artists.name AS artist_name,
              merch.created_at,
              json_build_object(
                'name', merch.name,
                'price', merch.price,
                'photo', merch.photo,
                'merch_type', merch.type
              ) AS data
       FROM merch
       JOIN artists ON artists.id = merch.artist_id
       JOIN follows ON follows.artist_id = merch.artist_id
       WHERE follows.user_id = $1

       ORDER BY created_at DESC`,
      [id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

export default router;