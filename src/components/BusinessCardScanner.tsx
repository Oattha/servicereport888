import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, RotateCcw, ScanLine, Upload, X } from "lucide-react";
import { recognizeBusinessCard, type BusinessCardFields } from "../utils/businessCardOcr";

type BusinessCardScannerProps = {
  onConfirm: (fields: Pick<BusinessCardFields, "companyName" | "companyAddress">) => void | Promise<void>;
};

const progressLabels: Record<string, string> = {
  "loading tesseract core": "กำลังเตรียมระบบ OCR",
  "initializing tesseract": "กำลังเริ่มระบบ OCR",
  "loading language traineddata": "กำลังโหลดภาษาไทยและอังกฤษ",
  "initializing api": "กำลังเตรียมตัวอ่านภาพ",
  "recognizing text": "กำลังอ่านข้อความบนนามบัตร"
};

export function BusinessCardScanner({ onConfirm }: BusinessCardScannerProps) {
  const [scanStatus, setScanStatus] = useState<"idle" | "reading" | "review" | "error">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProgressLabel, setScanProgressLabel] = useState("");
  const [scanError, setScanError] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRequestRef = useRef(0);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

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
        const denied = error instanceof DOMException && error.name === "NotAllowedError";
        setCameraError(denied
          ? "กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์แล้วลองใหม่"
          : "ไม่พบกล้องหรือไม่สามารถเชื่อมต่อกล้องได้");
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
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  }

  async function scanFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setScanError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      setScanStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScanError("รูปนามบัตรต้องมีขนาดไม่เกิน 10 MB");
      setScanStatus("error");
      return;
    }

    const requestId = scanRequestRef.current + 1;
    scanRequestRef.current = requestId;
    setPreviewUrl(URL.createObjectURL(file));
    setCompanyName("");
    setCompanyAddress("");
    setScanError("");
    setScanProgress(0);
    setScanProgressLabel("กำลังเตรียมระบบ OCR");
    setScanStatus("reading");

    try {
      const fields = await recognizeBusinessCard(file, (progress, status) => {
        if (scanRequestRef.current !== requestId) return;
        setScanProgress(Math.round(progress * 100));
        setScanProgressLabel(progressLabels[status] ?? "กำลังประมวลผลนามบัตร");
      });
      if (scanRequestRef.current !== requestId) return;
      setCompanyName(fields.companyName);
      setCompanyAddress(fields.companyAddress);
      setScanStatus("review");
    } catch (error) {
      if (scanRequestRef.current !== requestId) return;
      console.error("[Business card OCR failed]", error);
      setScanError("อ่านนามบัตรไม่สำเร็จ กรุณาใช้รูปที่คมชัดและลองใหม่");
      setScanStatus("error");
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void scanFile(file);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      closeCamera();
      void scanFile(new File([blob], `business-card-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.94);
  }

  function resetScan() {
    scanRequestRef.current += 1;
    setScanStatus("idle");
    setScanProgress(0);
    setScanProgressLabel("");
    setScanError("");
    setCompanyName("");
    setCompanyAddress("");
    setPreviewUrl("");
  }

  async function confirmResult() {
    if (!companyName.trim()) {
      setScanError("กรุณาตรวจสอบและกรอกชื่อบริษัทก่อนใช้งาน");
      return;
    }
    await onConfirm({
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim()
    });
  }

  return (
    <section className="business-card-scanner">
      <div className="business-card-scanner-header">
        <div className="business-card-scanner-icon"><ScanLine size={21} aria-hidden="true" /></div>
        <div>
          <h3>สแกนข้อมูลบริษัท</h3>
          <p>อ่านเฉพาะชื่อบริษัทและที่อยู่ รองรับภาษาไทยและอังกฤษ</p>
        </div>
      </div>
      <div className="business-card-scan-actions">
        <label className="business-card-action upload-card-action">
          <Upload size={17} aria-hidden="true" />
          อัปโหลดรูปนามบัตร
          <input type="file" accept="image/*" onChange={handleUpload} />
        </label>
        <button className="business-card-action camera-card-action" type="button" onClick={() => setCameraOpen(true)}>
          <Camera size={17} aria-hidden="true" />
          ถ่ายรูปนามบัตร
        </button>
      </div>

      {previewUrl ? (
        <div className="business-card-preview"><img src={previewUrl} alt="ตัวอย่างรูปนามบัตร" /></div>
      ) : null}

      {scanStatus === "reading" ? (
        <div className="business-card-progress" aria-live="polite">
          <div><Loader2 className="spin" size={18} aria-hidden="true" /><span>{scanProgressLabel}</span><strong>{scanProgress}%</strong></div>
          <progress value={scanProgress} max={100} />
          <small>ครั้งแรกอาจใช้เวลาสักครู่เพื่อโหลดโมเดลภาษา</small>
        </div>
      ) : null}

      {scanError ? <p className="business-card-error" role="alert">{scanError}</p> : null}

      {scanStatus === "review" ? (
        <div className="business-card-review">
          <div className="business-card-review-title">
            <strong>ตรวจสอบข้อมูลก่อนนำไปใช้</strong>
            <span>แก้ไขข้อความที่ OCR อ่านผิดได้</span>
          </div>
          <label>
            <span>ชื่อบริษัท</span>
            <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </label>
          <label>
            <span>ที่อยู่บริษัท</span>
            <textarea rows={3} value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} />
          </label>
          <div className="business-card-review-actions">
            <button type="button" className="business-card-reset" onClick={resetScan}>
              <RotateCcw size={16} aria-hidden="true" /> สแกนใหม่
            </button>
            <button type="button" className="business-card-confirm" onClick={() => void confirmResult()}>
              <Check size={17} aria-hidden="true" /> ใช้ข้อมูลและค้นหาบริษัท
            </button>
          </div>
        </div>
      ) : null}

      {cameraOpen ? (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-label="ถ่ายรูปนามบัตร">
          <div className="camera-dialog">
            <div className="camera-dialog-header">
              <div><strong>ถ่ายรูปนามบัตร</strong><span>จัดนามบัตรให้อยู่เต็มกรอบและภาพคมชัด</span></div>
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
                <Camera size={18} aria-hidden="true" /> ถ่ายรูป
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
