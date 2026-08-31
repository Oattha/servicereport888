# Service Report System — Frontend

ระบบรายงานการให้บริการและตรวจสอบข้อมูลอัตโนมัติ  
พัฒนาโดย **บริษัท เทส ทรู จำกัด**

---

## ภาพรวมระบบ

ระบบ Frontend นี้เป็นส่วนติดต่อผู้ใช้งาน (UI) สำหรับสร้างและพิมพ์รายงานการตรวจสอบ โดยเชื่อมต่อกับ Backend API สำหรับการยืนยันตัวตนและส่งเอกสาร

### ฟีเจอร์หลัก

- **แบบฟอร์ม 1.1 — แบบตรวจสอบอาคาร**  
  กรอกข้อมูลทั่วไป, รายการตรวจสอบ 4 หมวด (โครงสร้าง, ระบบอุปกรณ์, สมรรถนะ, บริหารจัดการ), พร้อมลงลายเซ็นดิจิทัล

- **แบบฟอร์ม 1.2 — แบบงานบริการทั่วไป**  
  กรอกรายละเอียดงานบริการ, ปัญหาที่พบ, ความเห็นวิศวกร, Drawing และลงลายเซ็น

- **พิมพ์ / Export PDF**  
  สร้าง PDF รายงานพร้อม Header, รายการตรวจสอบ, ลายเซ็น และ Footer บริษัท

- **บันทึก Draft อัตโนมัติ**  
  ข้อมูลที่กรอกไว้จะถูกบันทึกใน localStorage โดยอัตโนมัติ ไม่สูญหายเมื่อปิดหน้าเว็บ

- **ระบบ Login / Session**  
  ยืนยันตัวตนผ่าน Backend API และจัดการ session token

---

## Tech Stack

| ส่วนประกอบ | เทคโนโลยี |
|---|---|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Print / PDF | react-to-print |
| Containerization | Docker + Nginx |

---

## การติดตั้งและรันในเครื่อง (Local Development)

### ข้อกำหนดเบื้องต้น

- Node.js เวอร์ชัน **18 ขึ้นไป** (แนะนำ 22)
- npm เวอร์ชัน **9 ขึ้นไป**

### ขั้นตอน

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รันในโหมด development
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

> **หมายเหตุ:** ในโหมด development, Vite จะ proxy request `/api` ไปยัง Backend ที่ `http://3.0.18.6:8000` โดยอัตโนมัติ

---

## การ Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

ทดสอบ production build ในเครื่อง:

```bash
npm run preview
```

---

## การ Deploy ด้วย Docker

โปรเจกต์มี Dockerfile พร้อมใช้งาน (Multi-stage build: Node → Nginx)

```bash
# Build Docker image
docker build -t service-report-frontend .

# รัน container (port 80)
docker run -p 80:80 service-report-frontend
```

---

## โครงสร้างโปรเจกต์

```
src/
├── components/
│   ├── BuildingChecklistForm.jsx     # ฟอร์มรายการตรวจสอบอาคาร
│   ├── BuildingInspectionGeneralInfo.jsx  # ข้อมูลทั่วไปการตรวจสอบ
│   ├── GeneralServiceForm.jsx        # ฟอร์มงานบริการทั่วไป
│   ├── ManageReportDialog.jsx        # Dialog จัดการรายงาน
│   ├── ReportFooter.jsx              # ส่วนท้ายฟอร์ม (ลายเซ็น, ส่งรายงาน)
│   └── ReportPrintTemplate.jsx       # Template สำหรับพิมพ์ PDF
├── hooks/
│   └── useAuthSession.js             # Hook จัดการ Login / Session
├── pages/
│   ├── LoginPage.jsx                 # หน้า Login
│   └── ReportPage.jsx                # หน้าหลักของระบบ
└── utils/
    ├── config.js                     # Config กลาง (CHECKLIST_SECTIONS, BACKEND_URL)
    ├── formData.js                   # Helper สำหรับจัดการข้อมูลฟอร์ม
    ├── inputValidation.js            # Validation ระดับ field
    ├── pdf.js                        # Helper สำหรับ export PDF
    ├── reportDraftStorage.js         # จัดการ draft ใน localStorage
    └── validation.js                 # Validation ระดับฟอร์ม
```

---

## Environment / Configuration

ค่าตั้งต้นทั้งหมดอยู่ใน `src/utils/config.js`

| ค่า | คำอธิบาย |
|---|---|
| `BACKEND_URL` | URL ของ Backend API เช่น `http://3.0.18.6:8000` |
| `CHECKLIST_SECTIONS` | รายการตรวจสอบทั้ง 4 หมวด |

สำหรับ production สามารถกำหนดผ่าน environment variable:

```bash
VITE_BACKEND_URL=https://your-api.example.com
```

---
