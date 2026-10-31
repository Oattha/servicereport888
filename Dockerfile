FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

WORKDIR /app

# 1. ติดตั้ง curl, gnupg, ฟอนต์ภาษาไทยสำหรับ PDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    fonts-thai-tlwg \
    && rm -rf /var/lib/apt/lists/*

# 2. ติดตั้ง Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# 3. ติดตั้ง Python dependencies
COPY service/backend/requirements.txt ./service/backend/requirements.txt
RUN pip install --no-cache-dir -r ./service/backend/requirements.txt

# 4. ติดตั้ง Playwright Chromium และ dependencies สำหรับเรนเดอร์ PDF
RUN playwright install chromium
RUN playwright install-deps chromium

# 5. ติดตั้ง Node.js dependencies
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# 6. คัดลอกโค้ดทั้งหมด
COPY . .

# กำหนดสิทธิ์ให้ start.sh สามารถรันได้
RUN chmod +x ./start.sh

# พอร์ตสำหรับ Koyeb (ค่าเริ่มต้น 8000)
EXPOSE 8000

CMD ["./start.sh"]
