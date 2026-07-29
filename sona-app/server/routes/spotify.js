import express from "express";
import pool from "../config/database.js";

const router = express.Router();

const SCOPES = ["user-read-email", "playlist-modify-private"].join(" ");

// GET /api/spotify/authorize?user_id=1
router.get("/authorize", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    state: user_id, // carries the user id through the redirect round-trip
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// GET /api/spotify/callback
router.get("/callback", async (req, res) => {
  const { code, state: userId, error } = req.query;

  if (error) {
    return res.redirect(`http://localhost:5173/profile?spotify_error=${error}`);
  }

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error(tokenData);
      return res.redirect(`http://localhost:5173/profile?spotify_error=token_exchange_failed`);
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE users
       SET spotify_access_token = $1,
           spotify_refresh_token = $2,
           spotify_token_expires_at = $3
       WHERE id = $4`,
      [access_token, refresh_token, expiresAt, userId]
    );

    res.redirect(`http://localhost:5173/profile?spotify_connected=true`);
  } catch (err) {
    console.error(err);
    res.redirect(`http://localhost:5173/profile?spotify_error=server_error`);
  }
});

export default router;