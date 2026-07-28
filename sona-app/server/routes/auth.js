import express from "express";
import passport from "passport";
import pool from "../config/database.js";

const router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user"],
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    if (!req.user.onboarded) {
      return res.redirect(`${process.env.CLIENT_URL}/onboarding`);
    }
    res.redirect(process.env.CLIENT_URL);
  },
);

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({ success: false, message: "failure" });
});

router.post("/onboarding", async (req, res) => {
  const { role, artistName, genre } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  if (!role || (role !== "fan" && role !== "artist")) {
    return res.status(400).json({ error: "role must be 'fan' or 'artist'" });
  }

  const client = await pool.connect();
  let newArtistId = null;

  try {
    await client.query("BEGIN");

    if (role === "artist") {
      if (!artistName) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "artistName is required" });
      }

      const artistResult = await client.query(
        `INSERT INTO artists (name, genre) VALUES ($1, $2) RETURNING *`,
        [artistName, genre || null],
      );
      const artist = artistResult.rows[0];
      newArtistId = artist.id;

      await client.query(`INSERT INTO profile (artist_id) VALUES ($1)`, [
        artist.id,
      ]);

      await client.query(
        `INSERT INTO admin (user_id, artist_id) VALUES ($1, $2)`,
        [req.user.id, artist.id],
      );
    }

    const updatedUser = await client.query(
      `UPDATE users SET role = $1, onboarded = true WHERE id = $2 RETURNING *`,
      [role, req.user.id],
    );

    await client.query("COMMIT");
    req.login(updatedUser.rows[0], (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to update session" });
      res.json({
        user: updatedUser.rows[0],
        artistId: newArtistId,
      });
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Onboarding failed" });
  } finally {
    client.release();
  }
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid");
      res.redirect(`${process.env.CLIENT_URL}/login`);
    });
  });
});

export default router;
