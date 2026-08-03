import GitHubStrategy from "passport-github2";
import pool from "./database.js";
import "./dotenv.js";

const options = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
  proxy: true,
};

const verify = async (accessToken, refreshToken, profile, callback) => {
  const { id: githubId, login: username, avatar_url } = profile._json;

  try {
    const results = await pool.query(
      "SELECT * FROM users WHERE github_id = $1",
      [githubId],
    );
    const user = results.rows[0];

    if (!user) {
      const newUserResults = await pool.query(
        `INSERT INTO users (username, github_id, avatar_url)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [username, githubId, avatar_url],
      );
      return callback(null, newUserResults.rows[0]);
    }

    return callback(null, user);
  } catch (error) {
    return callback(error);
  }
};

export const GitHub = new GitHubStrategy(options, verify);
