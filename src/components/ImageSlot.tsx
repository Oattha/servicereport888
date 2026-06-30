import { ChangeEvent } from "react";
import { RefreshCw } from "lucide-react";
import type { TemplateImageEdit, TemplateImageSlot } from "../types";

type ImageSlotProps = {
  slot: TemplateImageSlot;
  edit?: TemplateImageEdit;
  onReplace: (slotKey: string, file: File) => void;
};

export function ImageSlot({ slot, edit, onReplace }: ImageSlotProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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
        <small>{edit ? `ไฟล์ใหม่: ${edit.fileName}` : "ใช้รูปเดิมจาก Template"}</small>
      </div>
      <label className="upload-button replace-button">
        <RefreshCw size={16} aria-hidden="true" />
        เปลี่ยนรูป
        <input type="file" accept="image/*" onChange={handleChange} />
      </label>
    </article>
  );
}
