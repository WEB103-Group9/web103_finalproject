import express from "express";
import cors from "cors";
import "./config/dotenv.js";
import artistsRouter from "./routes/artists.js";
import usersRouter from "./routes/users.js";
import followsRouter from "./routes/follows.js";
import postsRouter from "./routes/posts.js";
import merchRouter from "./routes/merch.js";
import concertRouter from './routes/concerts.js'

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/artists", artistsRouter);
app.use("/api/users", usersRouter);
app.use("/api/follows", followsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/merch", merchRouter);
app.use("/api/concerts", concertRouter);

app.listen(PORT, () => {
  console.log(`Sona server running on http://localhost:${PORT}`);
});
