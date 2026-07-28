import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });
    const user_id = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one cart item is required" });
    }

    await client.query("BEGIN");

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const merchId = Number(item.merch_id);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(merchId) || merchId <= 0) {
        throw new Error("Each item must have a valid merch_id");
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Each item must have a valid quantity");
      }
      const { rows } = await client.query(
        `SELECT id, name, price, stock
                FROM merch
                WHERE id = $1
                FOR UPDATE`,
        [merchId],
      );

      if (!rows.length) {
        throw new Error(`Merch item ${merchId} was not found`);
      }

      const merch = rows[0];

      if (merch.stock < quantity) {
        throw new Error(`Not enough stock available for ${merch.name}`);
      }

      const price = Number(merch.price);
      total += price * quantity;

      validatedItems.push({
        merch_id: merchId,
        quantity,
        price,
      });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, total)
             VALUES ($1, $2) RETURNING *`,
      [user_id, total],
    );

    const order = orderRows[0];
    const orderItems = [];

    for (const item of validatedItems) {
      const { rows: itemRows } = await client.query(
        `INSERT INTO order_items (
                order_id, merch_id, quantity, price)
                VALUES ($1, $2, $3, $4) RETURNING *`,
        [order.id, item.merch_id, item.quantity, item.price],
      );
      orderItems.push(itemRows[0]);

      await client.query(
        `UPDATE merch 
                SET stock = stock - $1
                WHERE id = $2`,
        [item.quantity, item.merch_id],
      );
    }
    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    res.status(400).json({
      error: err.message || "Failed to create order",
    });
  } finally {
    client.release();
  }
});

export default router;
