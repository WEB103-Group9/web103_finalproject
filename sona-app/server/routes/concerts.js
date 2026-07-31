import express from 'express';
import pool from '../config/database.js';
import { isAdminOf } from "./artists.js"; 

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { city } = req.query;
        const conditions = [];
        const values = [];
 
        if (city) {
            // filter by 1 city
            if (typeof city === "string" || (Array.isArray(city) && city.length === 1)) {
                values.push(city);
                conditions.push(`city = $${values.length}`)
            // filter by 2 or more cities
            } else if (Array.isArray(city) && city.length > 1) {
                city.forEach(element => {
                    values.push(element);
                    conditions.push(`city = $${values.length}`)
                });
            }
        }

        const where = conditions.length ? `WHERE ${conditions.join(' OR ')}` : ``;

        const result = await pool.query(`SELECT  * FROM concerts ${where} ORDER BY date ASC`, values)
        res.json(result.rows);
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "Failed to fetch concerts"})
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id, artist_id } = req.body;

    if (!(await isAdminOf(user_id, artist_id))) {
        return res.status(403).json({ error: "Not authorized to delete a concert for this artist" });
    }

    try {
        const result = await pool.query(`DELETE FROM concerts WHERE id = $1;`, [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({error: "Failed to delete concert"})
    }
})

export default router;