import process from "node:process";
import { v2 as cloudinary } from "cloudinary";

// SDK จะดึง process.env.CLOUDINARY_URL มาใช้งานให้อัตโนมัติ
cloudinary.config();

export async function uploadToCloudinary(fileBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "servicereport-uploads",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}