import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { pool } from "./db";

const app = express();
const port = Number(process.env.API_PORT ?? 3001);

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173" }));
app.use(express.json({ limit: "30mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

function isAllowedGoogleMapsUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();
  return url.protocol === "https:" && (
    hostname === "maps.app.goo.gl" ||
    hostname === "goo.gl" ||
    hostname === "google.com" ||
    hostname.endsWith(".google.com") ||
    hostname === "google.co.th" ||
    hostname.endsWith(".google.co.th")
  );
}

app.post("/api/maps/resolve", async (request, response) => {
  const input = typeof request.body?.url === "string" ? request.body.url.trim() : "";
  let currentUrl: URL;

  try {
    currentUrl = new URL(input);
  } catch {
    return response.status(400).json({ message: "Google Maps URL ไม่ถูกต้อง" });
  }

  if (!isAllowedGoogleMapsUrl(currentUrl)) {
    return response.status(400).json({ message: "รองรับเฉพาะ URL ของ Google Maps" });
  }

  try {
    for (let redirectCount = 0; redirectCount < 6; redirectCount += 1) {
      const googleResponse = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const location = googleResponse.headers.get("location");
      if (!location || googleResponse.status < 300 || googleResponse.status >= 400) {
        return response.json({ resolvedUrl: currentUrl.toString() });
      }

      const nextUrl = new URL(location, currentUrl);
      if (!isAllowedGoogleMapsUrl(nextUrl)) {
        return response.status(400).json({ message: "Google Maps redirect ไม่ถูกต้อง" });
      }
      currentUrl = nextUrl;
    }

    return response.status(400).json({ message: "Google Maps redirect มากเกินไป" });
  } catch {
    return response.status(502).json({ message: "ไม่สามารถเปิด Google Maps URL ได้" });
  }
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body as { email?: string; password?: string };

  if (!email || !password) {
    return response.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  const result = await pool.query(
    `
      SELECT id, full_name, username, email, password_hash, role, status
      FROM users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user || user.status !== "active" || !(await bcrypt.compare(password, user.password_hash))) {
    return response.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }

  await pool.query("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", [user.id]);

  response.json({
    id: user.id,
    name: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status
  });
});

app.get("/api/users", async (_request, response) => {
  const result = await pool.query(
    `
      SELECT id, full_name AS "fullName", username, email, role, status, last_login_at AS "lastLoginAt"
      FROM users
      ORDER BY created_at DESC
    `
  );

  response.json(result.rows);
});

app.post("/api/users", async (request, response) => {
  const { fullName, username, email, password, role, status } = request.body as {
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: string;
  };

  if (!fullName || !username || !email || !password || !role || !status) {
    return response.status(400).json({ message: "กรุณากรอกข้อมูลผู้ใช้ให้ครบ" });
  }

  if (!["admin", "user"].includes(role) || !["active", "inactive"].includes(status)) {
    return response.status(400).json({ message: "บทบาทหรือสถานะไม่ถูกต้อง" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `
        INSERT INTO users (full_name, username, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name AS "fullName", username, email, role, status, last_login_at AS "lastLoginAt"
      `,
      [fullName, username, email, passwordHash, role, status]
    );

    return response.status(201).json(result.rows[0]);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return response.status(409).json({ message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว" });
    }

    throw error;
  }
});

app.delete("/api/users/:id", async (request, response) => {
  await pool.query("DELETE FROM users WHERE id = $1", [request.params.id]);
  response.json({ ok: true });
});

app.get("/api/reports", async (_request, response) => {
  const result = await pool.query(
    `
      SELECT
        reports.id,
        reports.report_no AS "reportNo",
        COALESCE(customers.name, '-') AS customer,
        COALESCE(buildings.name, '-') AS building,
        COALESCE(report_templates.name, '-') AS template,
        COALESCE(users.full_name, 'User') AS inspector,
        reports.status,
        reports.progress,
        reports.updated_at AS "updatedAt"
      FROM reports
      LEFT JOIN customers ON customers.id = reports.customer_id
      LEFT JOIN buildings ON buildings.id = reports.building_id
      LEFT JOIN report_templates ON report_templates.id = reports.template_id
      LEFT JOIN users ON users.id = reports.inspector_id
      ORDER BY reports.updated_at DESC
    `
  );

  response.json(result.rows);
});

app.post("/api/reports", async (request, response) => {
  const {
    ownerCompany,
    customerEmail,
    buildingName,
    buildingAddress,
    templateCode,
    templateName,
    templatePages,
    inspectionDate,
    inspectorId
  } = request.body as {
    ownerCompany?: string;
    customerEmail?: string;
    buildingName?: string;
    buildingAddress?: string;
    templateCode?: string;
    templateName?: string;
    templatePages?: number;
    inspectionDate?: string;
    inspectorId?: string;
  };

  if (!ownerCompany?.trim() || !buildingName?.trim() || !templateCode?.trim() || !templateName?.trim()) {
    return response.status(400).json({ message: "กรุณากรอกชื่อเจ้าของอาคาร ชื่ออาคาร และเลือก Template" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const customerResult = await client.query(
      "INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id",
      [ownerCompany.trim(), customerEmail?.trim() || null]
    );
    const customerId = customerResult.rows[0].id;
    const buildingResult = await client.query(
      "INSERT INTO buildings (customer_id, name, address) VALUES ($1, $2, $3) RETURNING id",
      [customerId, buildingName.trim(), buildingAddress?.trim() || null]
    );
    const buildingId = buildingResult.rows[0].id;
    const templateResult = await client.query(
      `
        INSERT INTO report_templates (code, name, version, page_count, locked_fields_count, is_active)
        VALUES ($1, $2, '1.0', $3, 0, TRUE)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          page_count = EXCLUDED.page_count,
          updated_at = NOW()
        RETURNING id
      `,
      [templateCode.trim(), templateName.trim(), Number(templatePages) || 0]
    );
    const templateId = templateResult.rows[0].id;
    const validInspectorResult = inspectorId
      ? await client.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [inspectorId])
      : { rows: [] };
    const validInspectorId = validInspectorResult.rows[0]?.id ?? null;
    const reportNo = `RPT-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const reportResult = await client.query(
      `
        INSERT INTO reports (
          report_no, customer_id, building_id, template_id, inspector_id,
          status, progress, inspection_date
        )
        VALUES ($1, $2, $3, $4, $5, 'ready', 100, NULLIF($6, '')::date)
        RETURNING id
      `,
      [reportNo, customerId, buildingId, templateId, validInspectorId, inspectionDate ?? ""]
    );
    await client.query("COMMIT");

    const savedReport = await pool.query(
      `
        SELECT
          reports.id,
          reports.report_no AS "reportNo",
          customers.name AS customer,
          buildings.name AS building,
          report_templates.name AS template,
          COALESCE(users.full_name, 'User') AS inspector,
          reports.status,
          reports.progress,
          reports.updated_at AS "updatedAt"
        FROM reports
        LEFT JOIN customers ON customers.id = reports.customer_id
        LEFT JOIN buildings ON buildings.id = reports.building_id
        LEFT JOIN report_templates ON report_templates.id = reports.template_id
        LEFT JOIN users ON users.id = reports.inspector_id
        WHERE reports.id = $1
      `,
      [reportResult.rows[0].id]
    );
    return response.status(201).json(savedReport.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

app.post("/api/reports/:id/email", async (request, response) => {
  const { recipientEmail, fileName, pdfBase64 } = request.body as {
    recipientEmail?: string;
    fileName?: string;
    pdfBase64?: string;
  };
  const normalizedEmail = recipientEmail?.trim().toLowerCase() ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return response.status(400).json({ message: "กรุณากรอกอีเมลผู้รับให้ถูกต้อง" });
  }
  if (!fileName?.trim() || !pdfBase64) {
    return response.status(400).json({ message: "ไม่พบไฟล์ PDF สำหรับส่งอีเมล" });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return response.status(503).json({
      message: "ยังไม่ได้ตั้งค่าระบบส่งอีเมล กรุณากำหนด SMTP_HOST, SMTP_USER, SMTP_PASS และ SMTP_FROM"
    });
  }

  const reportResult = await pool.query(
    `
      SELECT reports.id, reports.report_no, customers.name AS customer, buildings.name AS building
      FROM reports
      LEFT JOIN customers ON customers.id = reports.customer_id
      LEFT JOIN buildings ON buildings.id = reports.building_id
      WHERE reports.id = $1
      LIMIT 1
    `,
    [request.params.id]
  );
  const report = reportResult.rows[0];
  if (!report) {
    return response.status(404).json({ message: "ไม่พบรายงานที่ต้องการส่ง" });
  }

  const attachment = Buffer.from(pdfBase64, "base64");
  if (attachment.length === 0 || attachment.length > 25 * 1024 * 1024) {
    return response.status(400).json({ message: "ไฟล์ PDF ไม่ถูกต้องหรือมีขนาดเกิน 25 MB" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass }
  });

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: normalizedEmail,
      subject: `รายงานตรวจสอบอาคาร ${report.building ?? report.report_no}`,
      text: `เรียนลูกค้า\n\nกรุณาตรวจสอบรายงานของ ${report.customer ?? "ลูกค้า"} ตามไฟล์ PDF ที่แนบมาพร้อมอีเมลนี้\n\nTEST TRUE`,
      attachments: [{ filename: fileName.trim(), content: attachment, contentType: "application/pdf" }]
    });
  } catch (error) {
    console.error("[Send report email failed]", error);
    return response.status(502).json({ message: "ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า SMTP แล้วลองอีกครั้ง" });
  }

  const sentAt = new Date();
  await pool.query(
    `UPDATE reports SET status = 'sent', recipient_email = $2, email_sent_at = $3, updated_at = NOW() WHERE id = $1`,
    [request.params.id, normalizedEmail, sentAt]
  );

  return response.json({ ok: true, recipientEmail: normalizedEmail, sentAt: sentAt.toISOString() });
});

app.get("/api/templates", async (_request, response) => {
  const result = await pool.query(
    `
      SELECT
        id,
        code,
        name,
        version,
        page_count AS "pageCount",
        locked_fields_count AS "lockedFieldsCount",
        is_active AS "isActive",
        updated_at AS "updatedAt"
      FROM report_templates
      ORDER BY updated_at DESC
    `
  );

  response.json(result.rows);
});

app.listen(port, "127.0.0.1", () => {
  console.log(`API server running at http://127.0.0.1:${port}`);
});
