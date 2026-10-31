import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const dbUrl = process.env.DATABASE_URL || "";
const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
const isSslDisabled = process.env.DB_SSLMODE === "disable";

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSslDisabled ? false : (!isLocal ? { rejectUnauthorized: false } : undefined)
});

// ดักจับ error ของ idle connection เพื่อป้องกัน process crash
pool.on("error", (err) => {
  console.error("--> [Database Pool Error]", err.message);
});
