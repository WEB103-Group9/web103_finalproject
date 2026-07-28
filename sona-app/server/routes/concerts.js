import express from "express";
import pool from "../config/database.js";
import { isAdminOf } from "./artists.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    const conditions = [];
    const values = [];

    if (city) {
      // filter by 1 city
      if (
        typeof city === "string" ||
        (Array.isArray(city) && city.length === 1)
      ) {
        values.push(`%${city}%`);
        conditions.push(`concerts.city ILIKE $${values.length}`);
        // filter by 2 or more cities
      } else if (Array.isArray(city) && city.length > 1) {
        city.forEach((element) => {
          values.push(`%${element}%`);
          conditions.push(`concerts.city ILIKE $${values.length}`);
        });
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" OR ")}` : ``;

    const result = await pool.query(
      `SELECT concerts.*, artists.name AS artist_name, artists.photo AS artist_photo
           FROM concerts
           JOIN artists ON artists.id = concerts.artist_id
           ${where}
           ORDER BY concerts.date ASC`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch concerts" });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const user_id = req.user.id;
  const { id } = req.params;
  const { artist_id } = req.body;

  if (!(await isAdminOf(user_id, artist_id))) {
    return res
      .status(403)
      .json({ error: "Not authorized to delete a concert for this artist" });
  }

  try {
    const result = await pool.query(`DELETE FROM concerts WHERE id = $1;`, [
      id,
    ]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete concert" });
  }
});

export default router;
