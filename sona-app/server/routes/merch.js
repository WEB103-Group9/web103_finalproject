import { Router } from "express";
import pool from "../config/database.js";
import { isAdminOf } from "./artists.js";

const router = Router();

// GET /api/merch?artist_id=&type=&sort=
router.get("/", async (req, res) => {
  try {
    const { artist_id, type, sort } = req.query;
    const conditions = [];
    const values = [];

    if (artist_id) {
      values.push(artist_id);
      conditions.push(`artist_id = $${values.length}`);
    }
    if (type) {
      values.push(type);
      conditions.push(`type = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortMap = {
      price_asc: "price ASC",
      price_desc: "price DESC",
    };
    const orderBy = sortMap[sort]
      ? `ORDER BY ${sortMap[sort]}`
      : "ORDER BY created_at DESC";

    const { rows } = await pool.query(
      `SELECT * FROM merch ${where} ${orderBy}`,
      values,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch merch" });
  }
});

// PATCH /api/merch/:id
router.patch("/:id", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });
    const user_id = req.user.id;
    const { name, type, price, photo, stock } = req.body;

    const { rows: existing } = await pool.query(
      "SELECT artist_id FROM merch WHERE id = $1",
      [req.params.id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Merch not found" });

    if (!(await isAdminOf(user_id, existing[0].artist_id))) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { rows } = await pool.query(
      `UPDATE merch SET
         name = COALESCE($1, name),
         type = COALESCE($2, type),
         price = COALESCE($3, price),
         photo = COALESCE($4, photo),
         stock = COALESCE($5, stock)
       WHERE id = $6 RETURNING *`,
      [name, type, price, photo, stock, req.params.id],
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update merch" });
  }
});

// DELETE /api/merch/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });
    const user_id = req.user.id;

    const { rows: existing } = await pool.query(
      "SELECT artist_id FROM merch WHERE id = $1",
      [req.params.id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Merch not found" });

    if (!(await isAdminOf(user_id, existing[0].artist_id))) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await pool.query("DELETE FROM merch WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete merch" });
  }
});

export default router;
