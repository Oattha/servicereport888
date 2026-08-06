import { ChangeEvent, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { TemplateImageEdit, TemplateImageSlot } from "../types";

type ImageSlotProps = {
  slot: TemplateImageSlot;
  edit?: TemplateImageEdit;
  onReplace: (slotKey: string, file: File) => void;
  hasDefaultImage?: boolean;
};

export function ImageSlot({ slot, edit, onReplace, hasDefaultImage = true }: ImageSlotProps) {
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const hasSupportedType = file.type === "image/jpeg" || file.type === "image/png";
    const hasSupportedExtension = /\.(?:jpe?g|png)$/i.test(file.name);
    
    if (!hasSupportedType || !hasSupportedExtension) {
      setErrorMessage("รองรับเฉพาะไฟล์ JPG, JPEG และ PNG");
      event.target.value = ""; // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้
      return;
    }

    // เพิ่มการตรวจสอบขนาดไฟล์ไม่ให้เกิน 15MB ป้องกันหน้าเว็บค้างหรือหน่วยความจำเต็ม
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์ใหญ่เกินไป (ต้องไม่เกิน 15 MB)");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    onReplace(slot.key, file);
  }

  return (
    <article className="upload-slot active">
      <div className="upload-slot-icon">
        <RefreshCw size={22} aria-hidden="true" />
      </div>
      <div>
        <strong>{slot.label}</strong>
        <span>หน้า {slot.page} · {slot.recommendedSize}</span>
        <small>แทนที่รูปเดิมในตำแหน่งล็อก: x {slot.x}, y {slot.y}, {slot.width} x {slot.height}</small>
        <small>{edit ? `ไฟล์ใหม่: ${edit.fileName}` : hasDefaultImage ? "ใช้รูปเดิมจาก Template" : "ยังไม่ได้อัปโหลดรูป"}</small>
      </div>
      <label className="upload-button replace-button">
        <RefreshCw size={16} aria-hidden="true" />
        เปลี่ยนรูป
        <input type="file" accept="image/*" onChange={handleChange} />
      </label>
      {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
    </article>
  );
}