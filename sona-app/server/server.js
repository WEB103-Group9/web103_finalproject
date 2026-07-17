import express from "express";
import cors from "cors";
import "./config/dotenv.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Sona server running on http://localhost:${PORT}`);
});
