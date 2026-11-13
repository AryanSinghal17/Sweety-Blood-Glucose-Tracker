
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { Pool } = require("pg");

console.log("DB configuration check:", {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  passwordType: typeof process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD is missing. Check backend/.env");
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error.message);
});

module.exports = pool;
