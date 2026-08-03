import express from "express";
import crypto from "crypto";
import pool from "../config/database.js";

const router = express.Router();

const SCOPES = ["user-read-email", "playlist-modify-private"].join(" ");

// GET /api/spotify/authorize?user_id=1
router.get("/authorize", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const state = crypto.randomBytes(16).toString("hex");
  req.session.spotifyOAuthState = state;

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// GET /api/spotify/callback
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.CLIENT_URL}/profile?spotify_error=${error}`);
  }

  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/profile?spotify_error=not_logged_in`);
  }

  if (!state || state !== req.session.spotifyOAuthState) {
    return res.redirect(`${process.env.CLIENT_URL}/profile?spotify_error=invalid_state`);
  }
  delete req.session.spotifyOAuthState;

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
      return res.redirect(`${process.env.CLIENT_URL}/profile?spotify_error=token_exchange_failed`);
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `UPDATE users
       SET spotify_access_token = $1,
           spotify_refresh_token = $2,
           spotify_token_expires_at = $3
       WHERE id = $4`,
      [access_token, refresh_token, expiresAt, req.user.id]
    );

    res.redirect(`${process.env.CLIENT_URL}/profile?spotify_connected=true`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/profile?spotify_error=server_error`);
  }
});

export default router;