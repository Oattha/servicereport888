import process from "node:process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "servicereport-images";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(
  fileBuffer: Buffer | Uint8Array,
  fileName: string,
  mimeType: string
): Promise<string> {
  const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    })
  );

  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${fileKey}`;
}