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

export default router;
