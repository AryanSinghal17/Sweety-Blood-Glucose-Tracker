require("dotenv").config();
const express = require("express");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
console.log(
  "DB password loaded:",
  typeof process.env.DB_PASSWORD
);
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Sweety Backend is running!");
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      message: "PostgreSQL connected successfully!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      code: error.code,
    });
  }
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated!",
    userId: req.user.id,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
