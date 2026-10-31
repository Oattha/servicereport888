import { pool } from "./db";
import { autoMigrate } from "./autoMigrate";

autoMigrate()
  .then(() => {
    console.log("--> [Database] ✅ ฐานข้อมูลและตารางทั้งหมดพร้อมใช้งานแล้ว");
  })
  .catch((error) => {
    console.error("--> [Database] ❌ เกิดข้อผิดพลาดในการทำ Migration:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
