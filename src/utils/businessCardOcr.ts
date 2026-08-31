export type BusinessCardFields = {
  companyName: string;
  companyAddress: string;
  confidence: number;
};

const companyPattern = /(บริษัท|บจก\.?|บมจ\.?|จำกัด|ห้างหุ้นส่วน|company|co\.?\s*,?\s*ltd\.?|corporation|corp\.?|limited|ltd\.?|plc)/i;
const addressPattern = /(ที่อยู่|สำนักงานใหญ่|เลขที่|หมู่\s*\d|ซอย|ถนน|แขวง|ตำบล|เขต|อำเภอ|จังหวัด|กรุงเทพ|address|head\s*office|road|rd\.?|street|st\.?|district|subdistrict|province|thailand|\b\d{5}\b)/i;
const contactPattern = /(โทร|โทรศัพท์|มือถือ|แฟกซ์|อีเมล|เว็บไซต์|เลขประจำตัวผู้เสียภาษี|tax\s*id|tel\.?|phone|mobile|fax|e-?mail|www\.|https?:|@)/i;

function cleanLine(value: string) {
  return value.normalize("NFC").replace(/[|]+/g, " ").replace(/\s+/g, " ").trim();
}

function hasUsefulText(value: string) {
  return /[\p{L}\p{M}]/u.test(value) && value.length >= 2;
}

function companyLineScore(line: string, index: number) {
  if (contactPattern.test(line) || addressPattern.test(line)) return -100;
  let score = Math.max(0, 5 - index * 0.35);
  if (companyPattern.test(line)) score += 15;
  if (/[A-Z][A-Z\s&.-]{2,}/.test(line)) score += 2;
  if (/^[\d\W]+$/u.test(line)) score -= 10;
  if (line.length > 100) score -= 5;
  return score;
}

function stripAddressLabel(line: string) {
  return line
    .replace(/^\s*(?:ที่อยู่(?:บริษัท)?|สำนักงานใหญ่|address|head\s*office)\s*[:：-]?\s*/i, "")
    .trim();
}

export function extractBusinessCardFields(text: string): Omit<BusinessCardFields, "confidence"> {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line && hasUsefulText(line));

  const companyName = lines
    .map((line, index) => ({ line, score: companyLineScore(line, index) }))
    .sort((left, right) => right.score - left.score)[0]?.line ?? "";

  const addressStart = lines.findIndex((line) => addressPattern.test(line) && !contactPattern.test(line));
  const addressLines: string[] = [];
  if (addressStart >= 0) {
    for (let index = addressStart; index < Math.min(lines.length, addressStart + 5); index += 1) {
      const line = lines[index];
      if (contactPattern.test(line)) break;
      if (index > addressStart && companyPattern.test(line)) break;
      const cleaned = index === addressStart ? stripAddressLabel(line) : line;
      if (cleaned) addressLines.push(cleaned);
      if (/\b\d{5}\b/.test(line) || /thailand/i.test(line)) break;
    }
  }

  return {
    companyName,
    companyAddress: addressLines.join(" ").trim()
  };
}

export async function recognizeBusinessCard(
  image: File,
  onProgress?: (progress: number, status: string) => void
): Promise<BusinessCardFields> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["tha", "eng"], 1, {
    logger: (message) => onProgress?.(message.progress ?? 0, message.status ?? "")
  });

  try {
    await worker.setParameters({ preserve_interword_spaces: "1" });
    const result = await worker.recognize(image, { rotateAuto: true });
    return {
      ...extractBusinessCardFields(result.data.text),
      confidence: result.data.confidence ?? 0
    };
  } finally {
    await worker.terminate();
  }
}
