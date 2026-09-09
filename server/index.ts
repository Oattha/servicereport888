import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { pool } from "./db";
import { signToken, authMiddleware, adminOnly, type AuthRequest } from "./auth";
import { companyNameSimilarity, normalizeBuildingName, normalizeCompanyName } from "./companyMatching";

const app = express();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
const host = process.env.API_HOST ?? "127.0.0.1";
const webOrigin = process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173";

import multer from "multer";
import { uploadToCloudinary } from './src/cloudinary';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // ลิมิตรูปละ 10MB

// 1. อนุญาต CORS ทุก Origin พร้อมจัดการ OPTIONS Request ทั้งหมด
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: false,
  })
);

app.use(express.json({ limit: "30mb" }));

// Security headers middleware
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("X-XSS-Protection", "1; mode=block");
  next();
});

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

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password: string): boolean {
  return Boolean(password && password.length >= 6);
}

app.post("/api/auth/login", async (request, response) => {
  try {
    const { email, password } = request.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return response.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    if (!validateEmail(email)) {
      return response.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
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

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return response.json({
      id: user.id,
      name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      token
    });
  } catch (error) {
    console.error("[Login error]", error);
    return response.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
});

app.get("/api/users", authMiddleware, async (_request, response) => {
  try {
    const result = await pool.query(
      `
        SELECT id, full_name AS "fullName", username, email, role, status, last_login_at AS "lastLoginAt"
        FROM users
        ORDER BY created_at DESC
      `
    );
    return response.json(result.rows);
  } catch (error) {
    console.error("[Get users error]", error);
    return response.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
  }
});

app.post("/api/users", authMiddleware, adminOnly, async (request, response) => {
  const { fullName, username, email, password, role, status } = request.body as {
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: string;
  };

  if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password || !role || !status) {
    return response.status(400).json({ message: "กรุณากรอกข้อมูลผู้ใช้ให้ครบ" });
  }

  if (!validateEmail(email)) {
    return response.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
  }

  if (!validatePassword(password)) {
    return response.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }

  if (!["admin", "user"].includes(role) || !["active", "inactive"].includes(status)) {
    return response.status(400).json({ message: "บทบาทหรือสถานะไม่ถูกต้อง" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users (full_name, username, email, password_hash, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name AS "fullName", username, email, role, status, last_login_at AS "lastLoginAt"
      `,
      [fullName.trim(), username.trim(), email.trim(), passwordHash, role, status]
    );

    return response.status(201).json(result.rows[0]);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return response.status(409).json({ message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว" });
    }
    console.error("[Create user error]", error);
    return response.status(500).json({ message: "ไม่สามารถสร้างผู้ใช้งานได้" });
  }
});

app.delete("/api/users/:id", authMiddleware, adminOnly, async (request, response) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [request.params.id]);
    return response.json({ ok: true });
  } catch (error) {
    console.error("[Delete user error]", error);
    return response.status(500).json({ message: "ไม่สามารถลบผู้ใช้งานได้" });
  }
});

type CompanyIndexRow = {
  id: string;
  name: string;
  normalizedName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  buildingCount: number;
  reportCount: number;
  lastActivityAt: string;
};

async function getCompanyIndexRows() {
  const result = await pool.query<CompanyIndexRow>(
    `
      SELECT
        customers.id,
        customers.name,
        customers.normalized_name AS "normalizedName",
        customers.email,
        customers.phone,
        customers.created_at AS "createdAt",
        customers.updated_at AS "updatedAt",
        COUNT(DISTINCT buildings.id)::int AS "buildingCount",
        COUNT(DISTINCT reports.id)::int AS "reportCount",
        GREATEST(
          customers.updated_at,
          COALESCE(MAX(buildings.updated_at), customers.updated_at),
          COALESCE(MAX(reports.updated_at), customers.updated_at)
        ) AS "lastActivityAt"
      FROM customers
      LEFT JOIN buildings ON buildings.customer_id = customers.id
      LEFT JOIN reports ON reports.customer_id = customers.id
      GROUP BY customers.id
      ORDER BY customers.created_at ASC
    `
  );
  return result.rows;
}

app.get("/api/companies/search", authMiddleware, async (request, response) => {
  const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
  const normalizedQuery = normalizeCompanyName(query);
  if (normalizedQuery.length < 1) return response.json([]);

  try {
    const rows = await getCompanyIndexRows();
    const groups = new Map<string, CompanyIndexRow[]>();
    rows.forEach((row) => {
      const key = normalizeCompanyName(row.name);
      if (!key) return;
      groups.set(key, [...(groups.get(key) ?? []), row]);
    });

    const results = Array.from(groups.entries())
      .map(([normalizedName, group]) => {
        const similarityScore = Math.max(...group.map((row) => companyNameSimilarity(query, row.name)));
        const score = normalizedName.startsWith(normalizedQuery)
          ? Math.max(similarityScore, normalizedName === normalizedQuery ? 1 : 0.98)
          : similarityScore;
        const canonical = group.find((row) => row.normalizedName === normalizedName) ?? group[0];
        const aliases = Array.from(new Set(group.map((row) => row.name)));
        const emails = Array.from(new Set(group.map((row) => row.email).filter(Boolean))) as string[];
        return {
          id: canonical.id,
          name: canonical.name,
          normalizedName,
          aliases,
          emails,
          buildingCount: group.reduce((sum, row) => sum + row.buildingCount, 0),
          reportCount: group.reduce((sum, row) => sum + row.reportCount, 0),
          lastActivityAt: group.reduce(
            (latest, row) => latest > row.lastActivityAt ? latest : row.lastActivityAt,
            group[0].lastActivityAt
          ),
          matchType: score === 1 ? "exact" : "similar",
          score
        };
      })
      .filter((item) => item.score >= 0.35)
      .sort((left, right) => right.score - left.score || right.reportCount - left.reportCount)
      .slice(0, 8);

    return response.json(results);
  } catch (error) {
    console.error("[Search companies error]", error);
    return response.status(500).json({ message: "ไม่สามารถค้นหาข้อมูลบริษัทได้" });
  }
});

app.get("/api/companies/:id/history", authMiddleware, async (request, response) => {
  try {
    const rows = await getCompanyIndexRows();
    const selected = rows.find((row) => row.id === request.params.id);
    if (!selected) return response.status(404).json({ message: "ไม่พบข้อมูลบริษัท" });

    const normalizedName = normalizeCompanyName(selected.name);
    const relatedCustomers = rows.filter((row) => normalizeCompanyName(row.name) === normalizedName);
    const customerIds = relatedCustomers.map((row) => row.id);
    const [buildingResult, reportResult] = await Promise.all([
      pool.query(
        `
          SELECT
            buildings.id,
            buildings.customer_id AS "customerId",
            buildings.name,
            buildings.address,
            buildings.province,
            buildings.postal_code AS "postalCode",
            buildings.phone,
            buildings.fax,
            buildings.gps_lat AS "gpsLat",
            buildings.gps_lng AS "gpsLng",
            buildings.created_at AS "createdAt",
            buildings.updated_at AS "updatedAt"
          FROM buildings
          WHERE buildings.customer_id = ANY($1::uuid[])
          ORDER BY buildings.updated_at DESC
        `,
        [customerIds]
      ),
      pool.query(
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
          reports.recipient_email AS "recipientEmail",  
          reports.email_sent_at AS "emailSentAt",      
          reports.signed_pdf_url AS "signedPdfUrl",
          reports.customer_remarks AS "customerRemarks",
          reports.sign_token AS "signToken",
          reports.updated_at AS "updatedAt",
          reports.data
        FROM reports
          LEFT JOIN buildings ON buildings.id = reports.building_id
          LEFT JOIN report_templates ON report_templates.id = reports.template_id
          WHERE reports.customer_id = ANY($1::uuid[])
             OR buildings.customer_id = ANY($1::uuid[])
          ORDER BY reports.updated_at DESC
        `,
        [customerIds]
      )
    ]);

    const canonical = relatedCustomers.find((row) => row.normalizedName === normalizedName) ?? relatedCustomers[0];
    return response.json({
      company: {
        id: canonical.id,
        normalizedName,
        names: Array.from(new Set(relatedCustomers.map((row) => row.name))),
        emails: Array.from(new Set(relatedCustomers.map((row) => row.email).filter(Boolean))),
        phones: Array.from(new Set(relatedCustomers.map((row) => row.phone).filter(Boolean))),
        customerIds,
        createdAt: relatedCustomers[0].createdAt,
        updatedAt: relatedCustomers.reduce(
          (latest, row) => latest > row.updatedAt ? latest : row.updatedAt,
          relatedCustomers[0].updatedAt
        )
      },
      buildings: buildingResult.rows,
      reports: reportResult.rows
    });
  } catch (error) {
    console.error("[Get company history error]", error);
    return response.status(500).json({ message: "ไม่สามารถดึงประวัติบริษัทได้" });
  }
});

app.get("/api/reports", authMiddleware, async (_request, response) => {
  try {
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
          reports.recipient_email AS "recipientEmail",  
          reports.email_sent_at AS "emailSentAt",      
          reports.signed_pdf_url AS "signedPdfUrl",
          reports.customer_remarks AS "customerRemarks",
          reports.sign_token AS "signToken",
          reports.updated_at AS "updatedAt",
          reports.data
        FROM reports
        LEFT JOIN customers ON customers.id = reports.customer_id
        LEFT JOIN buildings ON buildings.id = reports.building_id
        LEFT JOIN report_templates ON report_templates.id = reports.template_id
        LEFT JOIN users ON users.id = reports.inspector_id
        ORDER BY reports.updated_at DESC
      `
    );
    return response.json(result.rows);
  } catch (error) {
    console.error("[Get reports error]", error);
    return response.status(500).json({ message: "ไม่สามารถดึงข้อมูลรายงานได้" });
  }
});

app.post("/api/reports", authMiddleware, async (request, response) => {
  const {
    ownerCompany,
    customerEmail,
    buildingName,
    buildingAddress,
    templateCode,
    templateName,
    templatePages,
    inspectionDate,
    inspectorId,
    selectedCompanyId,
    data
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
    selectedCompanyId?: string;
    data?: unknown;
  };

  if (!ownerCompany?.trim() || !buildingName?.trim() || !templateCode?.trim() || !templateName?.trim()) {
    return response.status(400).json({ message: "กรุณากรอกชื่อเจ้าของอาคาร ชื่ออาคาร และเลือก Template" });
  }
  if (!normalizeCompanyName(ownerCompany)) {
    return response.status(400).json({ message: "กรุณากรอกชื่อบริษัทที่มีรายละเอียดมากกว่าคำนำหน้าหรือคำว่า จำกัด" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inputNormalizedName = normalizeCompanyName(ownerCompany);
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [inputNormalizedName]);

    const allCustomersResult = await client.query<{
      id: string;
      name: string;
      normalizedName: string | null;
    }>(`SELECT id, name, normalized_name AS "normalizedName" FROM customers ORDER BY created_at ASC`);
    const selectedCustomer = selectedCompanyId
      ? allCustomersResult.rows.find((row) => row.id === selectedCompanyId)
      : undefined;
    const targetNormalizedName = selectedCustomer
      ? normalizeCompanyName(selectedCustomer.name)
      : inputNormalizedName;
    let relatedCustomers = allCustomersResult.rows.filter(
      (row) => normalizeCompanyName(row.name) === targetNormalizedName
    );
    let canonicalCustomer = relatedCustomers.find(
      (row) => row.normalizedName === targetNormalizedName
    ) ?? selectedCustomer ?? relatedCustomers[0];

    if (!canonicalCustomer) {
      const insertedCustomer = await client.query<{
        id: string;
        name: string;
        normalizedName: string;
      }>(
        `
          INSERT INTO customers (name, normalized_name, email)
          VALUES ($1, $2, $3)
          ON CONFLICT (normalized_name) WHERE normalized_name IS NOT NULL AND normalized_name <> ''
          DO UPDATE SET updated_at = customers.updated_at
          RETURNING id, name, normalized_name AS "normalizedName"
        `,
        [ownerCompany.trim(), targetNormalizedName, customerEmail?.trim() || null]
      );
      canonicalCustomer = insertedCustomer.rows[0];
      relatedCustomers = [canonicalCustomer];
    } else {
      await client.query(
        `
          UPDATE customers
          SET normalized_name = $2
          WHERE id = $1
            AND normalized_name IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM customers existing WHERE existing.normalized_name = $2
            )
        `,
        [canonicalCustomer.id, targetNormalizedName]
      );
      const normalizedCanonical = await client.query<{
        id: string;
        name: string;
        normalizedName: string;
      }>(
        `SELECT id, name, normalized_name AS "normalizedName" FROM customers WHERE normalized_name = $1 LIMIT 1`,
        [targetNormalizedName]
      );
      canonicalCustomer = normalizedCanonical.rows[0] ?? canonicalCustomer;

      if (customerEmail?.trim()) {
        await client.query(
          `
            UPDATE customers
            SET email = $2, updated_at = NOW()
            WHERE id = $1 AND (email IS NULL OR btrim(email) = '')
          `,
          [canonicalCustomer.id, customerEmail.trim()]
        );
      }
    }

    const customerId = canonicalCustomer.id;
    const relatedCustomerIds = Array.from(new Set([
      customerId,
      ...relatedCustomers.map((row) => row.id)
    ]));
    const existingBuildings = await client.query<{
      id: string;
      name: string;
      address: string | null;
    }>(
      `SELECT id, name, address FROM buildings WHERE customer_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
      [relatedCustomerIds]
    );
    const normalizedBuildingName = normalizeBuildingName(buildingName);
    const normalizedBuildingAddress = normalizeBuildingName(buildingAddress ?? "");
    const matchingBuildings = existingBuildings.rows.filter(
      (building) => normalizeBuildingName(building.name) === normalizedBuildingName
    );
    const reusableBuilding = normalizedBuildingAddress
      ? matchingBuildings.find(
          (building) => normalizeBuildingName(building.address ?? "") === normalizedBuildingAddress
        )
      : matchingBuildings[0];
    const buildingId = reusableBuilding?.id ?? (await client.query<{ id: string }>(
      `INSERT INTO buildings (customer_id, name, address) VALUES ($1, $2, $3) RETURNING id`,
      [customerId, buildingName.trim(), buildingAddress?.trim() || null]
    )).rows[0].id;
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
        status, progress, inspection_date, data
      )
      VALUES ($1, $2, $3, $4, $5, 'ready', 100, NULLIF($6, '')::date, $7)
      RETURNING id
    `,
    [reportNo, customerId, buildingId, templateId, validInspectorId, inspectionDate ?? "", data == null ? null : JSON.stringify(data)]
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
    console.error("[Create report error]", error);
    return response.status(500).json({ message: "ไม่สามารถบันทึกรายงานได้" });
  } finally {
    client.release();
  }
});

app.post("/api/reports/:id/email", authMiddleware, async (request, response) => {
  try {
    const { 
      recipientEmail, 
      ccEmail, 
      fileName, 
      pdfBase64,
      subject,
      messageBody,
      signOff
    } = request.body as {
      recipientEmail?: string;
      ccEmail?: string;
      fileName?: string;
      pdfBase64?: string;
      subject?: string;
      messageBody?: string;
      signOff?: string;
    };

    const normalizedEmail = recipientEmail?.trim().toLowerCase() ?? "";
    const normalizedCc = ccEmail?.trim().toLowerCase() ?? "";

    if (!validateEmail(normalizedEmail)) {
      return response.status(400).json({ message: "กรุณากรอกอีเมลผู้รับให้ถูกต้อง" });
    }
    
    if (normalizedCc && !validateEmail(normalizedCc)) {
      return response.status(400).json({ message: "กรุณากรอกอีเมล CC ให้ถูกต้อง" });
    }

    if (!fileName?.trim() || !pdfBase64) {
      return response.status(400).json({ message: "ไม่พบไฟล์ PDF สำหรับส่งอีเมล" });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = (process.env.SMTP_FROM || "simonnazaa@gmail.com")
      .replace(/[<>]/g, "")
      .trim();

    if (!brevoApiKey) {
      return response.status(503).json({
        message: "ยังไม่ได้ตั้งค่า BREVO_API_KEY ในระบบ"
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

    // สร้าง Token สุ่มสำหรับลิงก์ Portal
    const signTokenStr = randomUUID().replace(/-/g, "");

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

    // ลิงก์ Portal
    const portalUrl = `https://servicereport.pages.dev/sign-portal?token=${signTokenStr}`;

    const finalSubject = subject?.trim() || `รายงานตรวจสอบอาคาร ${report.building ?? report.report_no}`;
    const finalBody = messageBody?.trim() || `เรียนลูกค้า\n\nกรุณาตรวจสอบรายงานของ ${report.customer ?? "ลูกค้า"} ตามไฟล์ PDF ที่แนบมาพร้อมอีเมลนี้`;
    const finalSignOff = signOff?.trim() || "TEST TRUE";

    // สำหรับไคลเอนต์อีเมลที่ไม่รองรับ HTML
    const fullTextContent = `${finalBody}\n\nท่านสามารถตรวจสอบและอัปโหลดเอกสารที่เซ็นรับรองแล้วได้ที่ลิงก์นี้:\n${portalUrl}\n\n${finalSignOff}`;

    // สร้าง HTML Template พร้อมปุ่มกด Action
    const formattedHtmlBody = finalBody.replace(/\n/g, "<br/>");
    const formattedHtmlSignOff = finalSignOff.replace(/\n/g, "<br/>");

    const fullHtmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin: 0 0 12px 0;">${finalSubject}</h2>
          <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0;">
            ${formattedHtmlBody}
          </p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="font-size: 14px; color: #64748b; margin: 0 0 14px 0;">
            เมื่อท่านตรวจสอบเอกสาร PDF ที่แนบมาแล้ว กรุณาคลิกปุ่มด้านล่างเพื่อเซ็นหรือส่งคืนเอกสาร
          </p>
          <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
            เข้าสู่หน้ารับรองและส่งคืนรายงาน
          </a>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 14px; color: #475569;">
          ${formattedHtmlSignOff}
        </div>
      </div>
    `;

    const payload: Record<string, unknown> = {
      sender: { name: "TEST TRUE", email: senderEmail },
      to: [{ email: normalizedEmail }],
      subject: finalSubject,
      textContent: fullTextContent,
      htmlContent: fullHtmlContent,
      // ปิด Click Tracking ของ Brevo เพื่อไม่ให้แปลงเป็นลิงก์ sendibt2.com
      headers: {
        "X-Mailin-Tag": "no-track",
        "X-Mailin-Custom": "click-tracking:off"
      },
      attachment: [
        {
          name: fileName.trim(),
          content: cleanBase64,
        },
      ],
    };

    if (normalizedCc) {
      payload.cc = [{ email: normalizedCc }];
    }

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const brevoData = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("[Brevo API Error]", brevoData);
      return response.status(502).json({
        message: (brevoData as { message?: string }).message || "ส่งอีเมลผ่าน Brevo API ไม่สำเร็จ"
      });
    }

    const sentAt = new Date();
    await pool.query(
      `UPDATE reports 
       SET status = 'sent', recipient_email = $2, email_sent_at = $3, sign_token = $4, updated_at = NOW() 
       WHERE id = $1`,
      [request.params.id, normalizedEmail, sentAt, signTokenStr]
    );

    return response.json({
      ok: true,
      recipientEmail: normalizedEmail,
      ccEmail: normalizedCc,
      sentAt: sentAt.toISOString()
    });
  } catch (error) {
    console.error("[Send report email failed]", error);
    return response.status(502).json({ message: "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
  }
});

// ดึงข้อมูลรายงานผ่าน signToken สำหรับหน้า Portal
app.get("/api/portal/reports/:token", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT reports.id, reports.report_no AS "reportNo", reports.status,
               reports.signed_pdf_url AS "signedPdfUrl", reports.signed_at AS "signedAt",
               customers.name AS customer, buildings.name AS building
        FROM reports
        LEFT JOIN customers ON customers.id = reports.customer_id
        LEFT JOIN buildings ON buildings.id = reports.building_id
        WHERE reports.sign_token = $1
        LIMIT 1
      `,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเอกสารหรือลิงก์หมดอายุ" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// รับอัปโหลดไฟล์ที่เซ็นแล้วจากหน้า Portal พร้อมข้อความเพิ่มเติม
app.post("/api/portal/reports/:token/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาแนบไฟล์เอกสาร" });
    }

    const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";

    const reportResult = await pool.query(
      `SELECT id FROM reports WHERE sign_token = $1 LIMIT 1`,
      [req.params.token]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบเอกสารหรือลิงก์หมดอายุ" });
    }

    // อัปโหลดไฟล์ขึ้น Cloudinary
    const fileUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    // อัปเดตสถานะเป็น signed พร้อมบันทึก URL และ customer_remarks
    await pool.query(
      `
        UPDATE reports 
        SET status = 'signed', 
            signed_pdf_url = $2, 
            customer_remarks = $3,
            signed_at = NOW(), 
            updated_at = NOW() 
        WHERE id = $1
      `,
      [reportResult.rows[0].id, fileUrl, remarks || null]
    );

    return res.json({ ok: true, fileUrl });
  } catch (err) {
    console.error("[Portal Upload Error]", err);
    return res.status(500).json({ message: "อัปโหลดเอกสารไม่สำเร็จ" });
  }
});

app.get("/api/templates", authMiddleware, async (_request, response) => {
  try {
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
    return response.json(result.rows);
  } catch (error) {
    console.error("[Get templates error]", error);
    return response.status(500).json({ message: "ไม่สามารถดึงข้อมูลเทมเพลตได้" });
  }
});

// API สำหรับอัปโหลดรูปภาพเข้า Cloudflare R2
//app.post("/api/upload", authMiddleware, upload.single("file"), async (req, res) => {
//  try {
//    if (!req.file) {
//      return res.status(400).json({ message: "กรุณาแนบไฟล์รูปภาพ" });
//    }

//    const imageUrl = await uploadToR2(
//      req.file.buffer,
//      req.file.originalname,
//      req.file.mimetype
//    );

//    return res.json({ url: imageUrl });
//  } catch (error) {
//    console.error("[Upload error]", error);
//    return res.status(500).json({ message: "ไม่สามารถอัปโหลดรูปภาพได้" });
//  }
//});

// API สำหรับอัปโหลดรูปภาพเข้า Cloudinary
app.post("/api/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาแนบไฟล์รูปภาพ" });
    }

    // เรียกใช้ Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    return res.json({ url: imageUrl });
  } catch (error) {
    console.error("[Upload error]", error);
    return res.status(500).json({ message: "ไม่สามารถอัปโหลดรูปภาพได้" });
  }
});


app.listen(port, "0.0.0.0", () => {
  console.log(`API server running on port ${port}`);
});
