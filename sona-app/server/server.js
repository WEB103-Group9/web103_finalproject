import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./config/database.js";
import passport from "passport";
import "./config/dotenv.js";
import { GitHub } from "./config/auth.js";

import artistsRouter from "./routes/artists.js";
import usersRouter from "./routes/users.js";
import followsRouter from "./routes/follows.js";
import postsRouter from "./routes/posts.js";
import merchRouter from "./routes/merch.js";
import orderRoutes from "./routes/orders.js";
import concertRouter from "./routes/concerts.js";
import authRouter from "./routes/auth.js";
import spotifyRouter from "./routes/spotify.js";

const app = express();
const PORT = process.env.PORT || 3001;
const pgSession = connectPgSimple(session);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PATCH,DELETE",
    credentials: true,
  }),
);
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(GitHub);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/users", usersRouter);
app.use("/api/follows", followsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/merch", merchRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/concerts", concertRouter);
app.use("/api/spotify", spotifyRouter);

app.listen(PORT, () => {
  console.log(`Sona server running on http://localhost:${PORT}`);
});
