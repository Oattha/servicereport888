import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pool } from "./db";

async function initDb() {
  const schema = await readFile(join(process.cwd(), "database", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Database tables are ready.");
}

initDb()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
