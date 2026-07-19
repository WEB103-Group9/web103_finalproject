import { Router } from 'express';
import pool from '../db.js'; // adjust to your actual pool export path

const router = Router();

// helper: confirm req.user is the admin for a given artist
async function isArtistAdmin(userId, artistId) {
  const { rows } = await pool.query(
    'SELECT id FROM admin WHERE user_id = $1 AND artist_id = $2',
    [userId, artistId]
  );
  return rows.length > 0;
}

// GET /api/merch?artist_id=&type=&sort=
router.get('/merch', async (req, res) => {
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

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      price_asc: 'price ASC',
      price_desc: 'price DESC',
    };
    const orderBy = sortMap[sort] ? `ORDER BY ${sortMap[sort]}` : 'ORDER BY created_at DESC';

    const { rows } = await pool.query(
      `SELECT * FROM merch ${where} ${orderBy}`,
      values
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch merch' });
  }
});

// GET /api/artists/:id/merch
router.get('/artists/:id/merch', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM merch WHERE artist_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artist merch' });
  }
});

// POST /api/artists/:id/merch
router.post('/artists/:id/merch', async (req, res) => {
  try {
    const artistId = req.params.id;
    const authorized = await isArtistAdmin(req.user.id, artistId);
    if (!authorized) return res.status(403).json({ error: 'Not authorized' });

    const { name, type, price, photo, stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO merch (artist_id, name, type, price, photo, stock)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [artistId, name, type, price, photo, stock ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create merch' });
  }
});

// PATCH /api/merch/:id
router.patch('/merch/:id', async (req, res) => {
  try {
    const { rows: existing } = await pool.query(
      'SELECT artist_id FROM merch WHERE id = $1',
      [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Merch not found' });

    const authorized = await isArtistAdmin(req.user.id, existing[0].artist_id);
    if (!authorized) return res.status(403).json({ error: 'Not authorized' });

    const { name, type, price, photo, stock } = req.body;
    const { rows } = await pool.query(
      `UPDATE merch SET
         name = COALESCE($1, name),
         type = COALESCE($2, type),
         price = COALESCE($3, price),
         photo = COALESCE($4, photo),
         stock = COALESCE($5, stock)
       WHERE id = $6 RETURNING *`,
      [name, type, price, photo, stock, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update merch' });
  }
});

// DELETE /api/merch/:id
router.delete('/merch/:id', async (req, res) => {
  try {
    const { rows: existing } = await pool.query(
      'SELECT artist_id FROM merch WHERE id = $1',
      [req.params.id]
    );
    if (!existing.length) return res.status(404).json({ error: 'Merch not found' });

    const authorized = await isArtistAdmin(req.user.id, existing[0].artist_id);
    if (!authorized) return res.status(403).json({ error: 'Not authorized' });

    await pool.query('DELETE FROM merch WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete merch' });
  }
});

export default router;