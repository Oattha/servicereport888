import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import type { TemplateImageEdit, TemplateImageSlot } from "../types";

type ImageSlotProps = {
  slot: TemplateImageSlot;
  edit?: TemplateImageEdit;
  onReplace: (slotKey: string, file: File) => void;
  hasDefaultImage?: boolean;
};

export function ImageSlot({ slot, edit, onReplace, hasDefaultImage = true }: ImageSlotProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  useEffect(() => {
    if (!cameraOpen) return;

    let cancelled = false;

    async function startCamera() {
      setCameraError("");
      setCameraReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("เบราว์เซอร์นี้ไม่รองรับการใช้งานกล้อง");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (error) {
        const permissionDenied = error instanceof DOMException && error.name === "NotAllowedError";
        setCameraError(
          permissionDenied
            ? "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์แล้วลองอีกครั้ง"
            : "ไม่พบกล้องหรือไม่สามารถเชื่อมต่อกล้องได้"
        );
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen]);

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
  }

  function useImage(file: File) {
    const hasSupportedType = file.type === "image/jpeg" || file.type === "image/png";
    const hasSupportedExtension = /\.(?:jpe?g|png)$/i.test(file.name);

    if (!hasSupportedType || !hasSupportedExtension) {
      setErrorMessage("รองรับเฉพาะไฟล์ JPG, JPEG และ PNG");
      return false;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์ใหญ่เกินไป (ต้องไม่เกิน 15 MB)");
      return false;
    }

    setErrorMessage("");
    onReplace(slot.key, file);
    return true;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    useImage(file);
    event.target.value = "";
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("ไม่สามารถประมวลผลภาพจากกล้องได้");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError("ไม่สามารถบันทึกภาพจากกล้องได้");
        return;
      }

      const photo = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      if (useImage(photo)) closeCamera();
    }, "image/jpeg", 0.92);
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
      <div className="upload-slot-actions">
        <label className="upload-button replace-button">
          <RefreshCw size={16} aria-hidden="true" />
          เปลี่ยนรูป
          <input type="file" accept="image/jpeg,image/png" onChange={handleChange} />
        </label>
        <button className="upload-button camera-button" type="button" onClick={() => setCameraOpen(true)}>
          <Camera size={16} aria-hidden="true" />
          ถ่ายรูป
        </button>
      </div>
      {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
      {cameraOpen ? (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-label={`ถ่ายรูป ${slot.label}`}>
          <div className="camera-dialog">
            <div className="camera-dialog-header">
              <div>
                <strong>ถ่ายรูป</strong>
                <span>{slot.label}</span>
              </div>
              <button type="button" className="camera-close-button" onClick={closeCamera} aria-label="ปิดกล้อง">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="camera-preview">
              <video ref={videoRef} autoPlay muted playsInline />
              {!cameraReady && !cameraError ? <span>กำลังเชื่อมต่อกล้อง…</span> : null}
              {cameraError ? <p role="alert">{cameraError}</p> : null}
            </div>
            <div className="camera-dialog-actions">
              <button type="button" className="camera-cancel-button" onClick={closeCamera}>ยกเลิก</button>
              <button type="button" className="camera-shutter-button" onClick={capturePhoto} disabled={!cameraReady}>
                <Camera size={18} aria-hidden="true" />
                ถ่ายและใช้รูปนี้
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
