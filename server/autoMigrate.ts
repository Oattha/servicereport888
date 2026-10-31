import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { pool } from "./db";

const DEFAULT_TEMPLATES = [
  {
    code: "TMP-ANNUAL-2568",
    name: "รายงานตรวจสอบอาคาร (ประจำปี)",
    version: "1.0",
    pageCount: 26,
  },
  {
    code: "TMP-MAINTENANCE-PLAN",
    name: "แผนปฏิบัติการการตรวจบำรุงรักษาอาคาร (ประจำปี)",
    version: "1.0",
    pageCount: 19,
  },
  {
    code: "TMP-SIGN-INSPECTION-2568",
    name: "รายงานตรวจสอบป้าย",
    version: "1.0",
    pageCount: 15,
  },
  {
    code: "TMP-SIGN-MAINTENANCE-PLAN",
    name: "แผนปฏิบัติการการตรวจบำรุงรักษาป้าย",
    version: "1.0",
    pageCount: 7,
  },
];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 1. ตรวจสอบการเชื่อมต่อ Database พร้อมระบบ Retry อัตโนมัติ
 */
export async function checkDatabaseConnection(maxRetries = 5, delayMs = 2000): Promise<boolean> {
  console.log("--> [Database] กำลังตรวจสอบการเชื่อมต่อฐานข้อมูล...");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query<{
          current_database: string;
          current_user: string;
          version: string;
        }>("SELECT current_database(), current_user, split_part(version(), ' ', 2) as version");
        const row = result.rows[0];
        console.log(
          `--> [Database] ✅ เชื่อมต่อฐานข้อมูลสำเร็จ! Database: "${row.current_database}", User: "${row.current_user}", PostgreSQL v${row.version}`
        );
        return true;
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `--> [Database] ⚠️ การเชื่อมต่อล้มเหลว (ครั้งที่ ${attempt}/${maxRetries}): ${errorMsg}`
      );

      if (attempt < maxRetries) {
        console.log(`--> [Database] รอ ${delayMs / 1000} วินาที ก่อนลองเชื่อมต่อใหม่...`);
        await sleep(delayMs);
      }
    }
  }

  console.error("--> [Database] ❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้ครบตามจำนวนครั้งที่กำหนด");
  return false;
}

/**
 * 2. รัน Auto-Migration สร้างตารางและอินเด็กซ์อัตโนมัติ (ไม่ใช้ Prisma)
 */
export async function autoMigrate(): Promise<void> {
  console.log("--> [Database Auto-Migrate] กำลังเริ่มขั้นตอนตรวจสอบและสร้างตาราง...");

  // ขั้นตอน 1: เช็กการเชื่อมต่อ
  const connected = await checkDatabaseConnection(5, 2000);
  if (!connected) {
    throw new Error(
      "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ DATABASE_URL ในไฟล์ .env"
    );
  }

  const client = await pool.connect();
  try {
    // 2.1 สร้าง Extension pgcrypto (ถ้าไม่มีสิทธิ์ Superuser จะข้ามอย่างปลอดภัย)
    try {
      await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    } catch {
      // ข้ามได้ทันทีเพราะ PostgreSQL 13+ มี gen_random_uuid() ในตัว
    }

    // 2.2 ตาราง users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(160) NOT NULL,
        username VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(180) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(40) NOT NULL CHECK (role IN ('admin', 'user')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2.3 ตาราง customers
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(240) NOT NULL,
        normalized_name VARCHAR(240),
        contact_name VARCHAR(160),
        phone VARCHAR(40),
        email VARCHAR(180),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2.4 ตาราง buildings
    await client.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        name VARCHAR(240) NOT NULL,
        address TEXT,
        province VARCHAR(120),
        postal_code VARCHAR(20),
        phone VARCHAR(40),
        fax VARCHAR(40),
        gps_lat NUMERIC(10, 7),
        gps_lng NUMERIC(10, 7),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2.5 ตาราง report_templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(80) NOT NULL UNIQUE,
        name VARCHAR(240) NOT NULL,
        version VARCHAR(40) NOT NULL,
        page_count INTEGER NOT NULL DEFAULT 0,
        locked_fields_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2.6 ตาราง reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_no VARCHAR(80) NOT NULL UNIQUE,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
        template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
        inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'ready', 'sent', 'signed')),
        progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        inspection_date DATE,
        recipient_email VARCHAR(180),
        email_sent_at TIMESTAMPTZ,
        data JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2.7 Migration Columns & Constraints สำหรับ users, reports และ customers
    const alterStatements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;",
      "ALTER TABLE users ALTER COLUMN username DROP NOT NULL;",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(180);",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS data JSONB;",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS sign_token VARCHAR(64);",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS signed_pdf_url TEXT;",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS customer_remarks TEXT;",
      "ALTER TABLE reports ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;",
      "ALTER TABLE customers ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(240);",
    ];

    for (const sql of alterStatements) {
      await client.query(sql);
    }

    try {
      await client.query("ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;");
      await client.query(`
        ALTER TABLE reports
        ADD CONSTRAINT reports_status_check
        CHECK (status IN ('draft', 'in_review', 'ready', 'sent', 'signed'));
      `);
    } catch (constraintErr: unknown) {
      console.warn("--> [Database Auto-Migrate] ℹ️ ข้ามการปรับ status constraint:", (constraintErr as Error).message);
    }

    // 2.8 สร้าง Indexes
    const standardIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);",
      "CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);",
      "CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);",
      "CREATE INDEX IF NOT EXISTS idx_reports_customer_id ON reports(customer_id);",
      "CREATE INDEX IF NOT EXISTS idx_reports_building_id ON reports(building_id);",
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_sign_token_unique ON reports(sign_token) WHERE sign_token IS NOT NULL;",
      "CREATE INDEX IF NOT EXISTS idx_buildings_customer_id_name ON buildings(customer_id, name);",
    ];

    for (const sql of standardIndexes) {
      await client.query(sql);
    }

    // 2.9 Index สำหรับ normalized_name (ถ้ามีข้อมูลเดิมที่ซ้ำกัน จะสร้าง Index ปกติแทน UNIQUE เพื่อไม่ให้แอปล่ม)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_normalized_name_unique
        ON customers(normalized_name)
        WHERE normalized_name IS NOT NULL AND normalized_name <> '';
      `);
    } catch {
      // มีข้อมูลเดิมที่ซ้ำกัน สร้าง non-unique index เพื่อเพิ่มความเร็วในการ query แทน
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_customers_normalized_name
        ON customers(normalized_name)
        WHERE normalized_name IS NOT NULL AND normalized_name <> '';
      `);
    }

    console.log("--> [Database Auto-Migrate] ✅ ตรวจสอบและสร้างตารางใน Schema เรียบร้อย");

    // 2.10 ตรวจสอบตารางที่อยู่ในฐานข้อมูลจริง
    const tablesResult = await client.query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'customers', 'buildings', 'report_templates', 'reports')
      ORDER BY table_name ASC
    `);
    const existingTables = tablesResult.rows.map((r) => r.table_name);
    console.log(`--> [Database Auto-Migrate] 📋 ตารางพร้อมใช้งาน: [${existingTables.join(", ")}]`);

    // 2.11 เพิ่ม Default Report Templates ถ้ายังไม่มี
    for (const tpl of DEFAULT_TEMPLATES) {
      await client.query(
        `
        INSERT INTO report_templates (code, name, version, page_count, locked_fields_count, is_active)
        VALUES ($1, $2, $3, $4, 0, TRUE)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          page_count = EXCLUDED.page_count,
          updated_at = NOW()
        `,
        [tpl.code, tpl.name, tpl.version, tpl.pageCount]
      );
    }
    console.log("--> [Database Auto-Migrate] ✅ ตรวจสอบ Default Report Templates เรียบร้อย");

    // 2.12 ตรวจสอบและสร้าง Default Admin ถ้าตาราง users ยังว่างอยู่
    const usersCountResult = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM users"
    );
    const usersCount = Number(usersCountResult.rows[0]?.count || "0");

    if (usersCount === 0) {
      const adminEmail = (process.env.ADMIN_EMAIL || "testtrueservice@gmail.com").trim().toLowerCase();
      const adminPassword = (process.env.ADMIN_PASSWORD || "12345678").trim();
      const adminName = (process.env.ADMIN_NAME || "System Administrator").trim();
      const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();

      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await client.query(
        `
        INSERT INTO users (full_name, username, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, 'admin', 'active')
        `,
        [adminName, adminUsername, adminEmail, passwordHash]
      );

      console.log("------------------------------------------------------------");
      console.log("--> [Database Auto-Migrate] 👤 สร้างบัญชี Admin เริ่มต้นให้เรียบร้อย:");
      console.log(`    อีเมล:    ${adminEmail}`);
      console.log(`    ผู้ใช้:   ${adminUsername}`);
      console.log(`    รหัสผ่าน: ${adminPassword}`);
      console.log("    (สามารถนำไปใช้ล็อกอินระบบได้ทันที และเปลี่ยนรหัสภายหลังได้)");
      console.log("------------------------------------------------------------");
    } else {
      console.log(`--> [Database Auto-Migrate] ℹ️ พบผู้ใช้ในระบบแล้ว (${usersCount} บัญชี)`);
    }

  } finally {
    client.release();
  }
}
