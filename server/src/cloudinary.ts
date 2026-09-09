import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config();

export function uploadToCloudinary(buffer: Buffer, mimetype?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // ถ้าเป็น PDF บังคับใช้ raw เพื่อให้เปิดอ่าน/ดาวน์โหลดได้ทันทีโดยไม่ติด 401
    // ถ้าไม่ใช่ PDF (เช่น รูปภาพ jpg/png) ให้ใช้ auto ตามเดิม
    const resourceType = mimetype === "application/pdf" ? "raw" : "auto";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "servicereport-uploads",
        resource_type: resourceType,
        type: "upload",
        access_mode: "public"
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}