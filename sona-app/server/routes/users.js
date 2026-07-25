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

router.get("/:id/orders", async(req, res)=>{
  const userId = Number(req.params.id)

  if(!Number.isInteger(userId) || userId <= 0){
    return res.status(400).json({
      error: "A valid user ID is required",
    });
  }

  try{
    const userResult = await pool.query(
      `SELECT id FROM users
      WHERE id = $1`,[userId]
    );

    if(userResult.rows.length === 0){
      return res.status(404).json({
        error: "User not found",
      });
    }

     const result = await pool.query(
      `SELECT
         orders.id,
         orders.user_id,
         orders.total,
         orders.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', order_items.id,
               'merch_id', merch.id,
               'name', merch.name,
               'photo', merch.photo,
               'quantity', order_items.quantity,
               'price', order_items.price
             )
             ORDER BY order_items.id
           ) FILTER (WHERE order_items.id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM orders
       LEFT JOIN order_items
         ON order_items.order_id = orders.id
       LEFT JOIN merch
         ON merch.id = order_items.merch_id
       WHERE orders.user_id = $1
       GROUP BY orders.id
       ORDER BY orders.created_at DESC`,
      [userId],
    );
    res.json(result.rows);


  } catch(err){
    console.error("Failed to fetch order history:", err)

    res.status(500).json({
      error: "Failed to fetch order history",
    });
  }



})

export default router;
