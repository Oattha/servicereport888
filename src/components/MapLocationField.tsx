import { useCallback, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  type Libraries
} from "@react-google-maps/api";
import html2canvas from "html2canvas";
import { useDropzone } from "react-dropzone";
import { Camera, Crosshair, ExternalLink, ImagePlus, MapPin, Satellite, Search, Upload } from "lucide-react";
import { resolveGoogleMapsUrl } from "../lib/api";
import type { MapLocationValue } from "../types";
import { buildGoogleMapsUrl, isValidCoordinate, parseCoordinatesFromGoogleMapsUrl } from "../utils/mapLocation";

const mapLibraries: Libraries = ["places"];
const defaultCenter = { lat: 13.7563, lng: 100.5018 };

type MapLocationFieldProps = {
  value: MapLocationValue;
  onChange: (value: MapLocationValue) => void;
};

function formatCoordinate(value: number) {
  return value.toFixed(7);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Cannot read image"));
    reader.onerror = () => reject(reader.error ?? new Error("Cannot read image"));
    reader.readAsDataURL(file);
  });
}

export function MapLocationField({ value, onChange }: MapLocationFieldProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
  const mapCaptureRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const uploadRequestRef = useRef(0);
  const mapUrlRequestRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;
  const [searchText, setSearchText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasValidCoordinates =
    isValidCoordinate(value.latitude, -90, 90) && isValidCoordinate(value.longitude, -180, 180);

  const center = useMemo(() => {
    const latitude = Number(value.latitude);
    const longitude = Number(value.longitude);
    if (hasValidCoordinates) {
      return { lat: latitude, lng: longitude };
    }
    return defaultCenter;
  }, [hasValidCoordinates, value.latitude, value.longitude]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: mapLibraries
  });

  const updateCoordinates = useCallback(
    (lat: number, lng: number, nextFields: Partial<MapLocationValue> = {}) => {
      const latitude = formatCoordinate(lat);
      const longitude = formatCoordinate(lng);
      onChange({
        ...value,
        ...nextFields,
        latitude,
        longitude,
        googleMapsUrl: buildGoogleMapsUrl(latitude, longitude)
      });
    },
    [onChange, value]
  );

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const uploadRequest = uploadRequestRef.current + 1;
      uploadRequestRef.current = uploadRequest;

      setErrorMessage("");
      try {
        const uploadedImageUrl = await readFileAsDataUrl(file);
        if (uploadRequest !== uploadRequestRef.current) return;
        const latestValue = valueRef.current;
        if (latestValue.uploadedImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(latestValue.uploadedImageUrl);
        }
        onChange({
          ...latestValue,
          uploadedImageUrl,
          uploadedImageName: file.name,
          mapScreenshotUrl: uploadedImageUrl,
          mapImageSource: "upload"
        });
      } catch {
        setErrorMessage("ไม่สามารถอ่านไฟล์รูปภาพได้");
      }
    },
    [onChange]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop
  });

  function handlePlaceChanged() {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;

    updateCoordinates(location.lat(), location.lng(), {
      placeName: place.name ?? "",
      address: place.formatted_address ?? ""
    });
  }

  function handleCurrentLocation() {
    setErrorMessage("");
    if (!navigator.geolocation) {
      setErrorMessage("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่งปัจจุบัน");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCoordinates(position.coords.latitude, position.coords.longitude, {
          placeName: "Current Location",
          address: ""
        });
      },
      () => setErrorMessage("ไม่สามารถอ่านตำแหน่งปัจจุบันได้")
    );
  }

  async function handleCaptureMap() {
    if (!mapCaptureRef.current) return;

    setIsCapturing(true);
    setErrorMessage("");
    try {
      const canvas = await html2canvas(mapCaptureRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      onChange({
        ...valueRef.current,
        mapScreenshotUrl: canvas.toDataURL("image/png"),
        mapImageSource: "capture"
      });
    } catch {
      setErrorMessage("ไม่สามารถจับภาพแผนที่ได้");
    } finally {
      setIsCapturing(false);
    }
  }

  function handleCoordinateInput(key: "latitude" | "longitude", nextValue: string) {
    const nextLocation = {
      ...value,
      [key]: nextValue
    };
    const latitudeIsValid = isValidCoordinate(nextLocation.latitude, -90, 90);
    const longitudeIsValid = isValidCoordinate(nextLocation.longitude, -180, 180);
    const editedValueIsValid = key === "latitude" ? latitudeIsValid : longitudeIsValid;
    setErrorMessage(
      nextValue && !editedValueIsValid
        ? key === "latitude"
          ? "Latitude ต้องเป็นตัวเลขระหว่าง -90 ถึง 90"
          : "Longitude ต้องเป็นตัวเลขระหว่าง -180 ถึง 180"
        : ""
    );
    onChange({
      ...nextLocation,
      googleMapsUrl:
        latitudeIsValid && longitudeIsValid
          ? buildGoogleMapsUrl(nextLocation.latitude, nextLocation.longitude)
          : nextLocation.googleMapsUrl
    });
  }

  async function handleGoogleMapsUrlInput(nextUrl: string) {
    const requestId = mapUrlRequestRef.current + 1;
    mapUrlRequestRef.current = requestId;
    const parsedCoordinates = parseCoordinatesFromGoogleMapsUrl(nextUrl);
    setErrorMessage("");
    onChange({
      ...value,
      googleMapsUrl: nextUrl,
      ...(parsedCoordinates ?? {})
    });
    if (parsedCoordinates) return;

    try {
      const parsedUrl = new URL(nextUrl);
      const hostname = parsedUrl.hostname.toLowerCase();
      const isGoogleMapsHost =
        parsedUrl.protocol === "https:" &&
        (hostname === "maps.app.goo.gl" ||
          hostname === "goo.gl" ||
          hostname === "google.com" ||
          hostname.endsWith(".google.com") ||
          hostname === "google.co.th" ||
          hostname.endsWith(".google.co.th"));
      if (!isGoogleMapsHost) return;

      const { resolvedUrl } = await resolveGoogleMapsUrl(nextUrl);
      if (requestId !== mapUrlRequestRef.current || valueRef.current.googleMapsUrl !== nextUrl) return;
      const resolvedCoordinates = parseCoordinatesFromGoogleMapsUrl(resolvedUrl);
      if (!resolvedCoordinates) {
        setErrorMessage("ไม่พบพิกัดใน Google Maps URL กรุณากรอก Latitude และ Longitude เอง");
        return;
      }
      onChange({
        ...valueRef.current,
        ...resolvedCoordinates,
        googleMapsUrl: nextUrl
      });
    } catch {
      if (requestId === mapUrlRequestRef.current && valueRef.current.googleMapsUrl === nextUrl) {
        setErrorMessage("ไม่สามารถอ่านพิกัดจาก Google Maps URL ได้ กรุณากรอกพิกัดเอง");
      }
    }
  }

  const handleOpenGoogleMaps = () => {
    const url = value.googleMapsUrl.trim() || "https://www.google.com/maps";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="map-location-field">
      <div className="map-location-header">
        <div>
          <span>Page 15</span>
          <h2>ตำแหน่งแผนที่และรูปสถานที่</h2>
          <p>กรอกลิงก์ Google Maps และอัปโหลดรูปภาพแผนที่จากการแคปหน้าจอลงในกรอบด้านล่าง</p>
        </div>
        {/*
        <button
          className={value.satellite ? "secondary-action small-action active" : "secondary-action small-action"}
          type="button"
          onClick={() => onChange({ ...value, satellite: !value.satellite })}
        >
          <Satellite size={16} aria-hidden="true" />
          Satellite
        </button>
        */}
      </div>

      {/* 
      <div className="map-search-row">
        {apiKey && isLoaded ? (
          <Autocomplete onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }} onPlaceChanged={handlePlaceChanged}>
            <label className="map-search-box">
              <Search size={18} aria-hidden="true" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search place"
              />
            </label>
          </Autocomplete>
        ) : (
          <label className="map-search-box">
            <Search size={18} aria-hidden="true" />
            <input
              disabled
              placeholder={loadError ? "Google Maps load failed" : "Set VITE_GOOGLE_MAPS_API_KEY to enable search"}
            />
          </label>
        )}
        <button className="secondary-action small-action" type="button" onClick={handleCurrentLocation}>
          <Crosshair size={16} aria-hidden="true" />
          Current Location
        </button>
        <button className="secondary-action small-action" type="button" onClick={handleCaptureMap} disabled={isCapturing}>
          <Camera size={16} aria-hidden="true" />
          {isCapturing ? "Capturing..." : "Capture Map"}
        </button>
      </div>
      */}

      {/*
      <div className="map-location-grid">
        <div className="map-capture-surface" ref={mapCaptureRef}>
          {apiKey && isLoaded ? (
            <GoogleMap
              center={center}
              mapContainerClassName="google-map"
              mapTypeId={value.satellite ? "satellite" : "roadmap"}
              onClick={(event) => {
                const lat = event.latLng?.lat();
                const lng = event.latLng?.lng();
                if (lat === undefined || lng === undefined) return;
                updateCoordinates(lat, lng);
              }}
              options={{
                fullscreenControl: false,
                mapTypeControl: false,
                streetViewControl: false
              }}
              zoom={16}
            >
              {hasValidCoordinates ? <MarkerF position={center} /> : null}
            </GoogleMap>
          ) : (
            <div className="map-placeholder">
              <MapPin size={36} aria-hidden="true" />
              <strong>Google Map</strong>
              <span>เพิ่ม `VITE_GOOGLE_MAPS_API_KEY` ในไฟล์ `.env` เพื่อเปิดแผนที่และค้นหาสถานที่</span>
            </div>
          )}
        </div>
      */}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
        <div className="form-grid compact">
          {/*
          <label className="field">
            <span>Latitude</span>
            <input
              aria-invalid={value.latitude !== "" && !isValidCoordinate(value.latitude, -90, 90)}
              inputMode="decimal"
              max="90"
              min="-90"
              step="any"
              type="number"
              value={value.latitude}
              onChange={(event) => handleCoordinateInput("latitude", event.target.value)}
            />
          </label>
          */}

          {/* 
          <label className="field">
            <span>Longitude</span>
            <input
              aria-invalid={value.longitude !== "" && !isValidCoordinate(value.longitude, -180, 180)}
              inputMode="decimal"
              max="180"
              min="-180"
              step="any"
              type="number"
              value={value.longitude}
              onChange={(event) => handleCoordinateInput("longitude", event.target.value)}
            />
          </label>
          */}

          <label className="field full">
            <span>Google Maps URL</span>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", width: "100%" }}>
              <input
                value={value.googleMapsUrl}
                onChange={(event) => handleGoogleMapsUrlInput(event.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                style={{ flex: "1 1 auto", minWidth: "0" }}
              />
              <button
                type="button"
                onClick={handleOpenGoogleMaps}
                title="เปิด Google Maps ในแท็บใหม่เพื่อค้นหา/แคปหน้าจอ"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  padding: "0.6rem 1rem",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  width: "auto",
                  height: "38px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                <ExternalLink size={16} aria-hidden="true" />
                เปิด Google Maps
              </button>
            </div>
          </label>
        </div>

        <div {...getRootProps({ className: isDragActive ? "map-upload-zone active" : "map-upload-zone" })}>
          <input {...getInputProps()} />
          <Upload size={28} aria-hidden="true" />
          <strong>อัปโหลดรูปภาพแผนที่ (แคปหน้าจอ)</strong>
          <span>{value.uploadedImageName || "ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์รูปภาพ"}</span>
        </div>

        {(value.uploadedImageUrl || value.mapScreenshotUrl) && (
          <div className="map-preview-single" style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginBottom: "0.5rem" }}>
              ตัวอย่างรูปภาพแผนที่ที่จะแสดงบน PDF หน้า 15
            </span>
            <img
              alt="Uploaded map preview"
              src={value.uploadedImageUrl || value.mapScreenshotUrl}
              style={{ maxWidth: "100%", maxHeight: "280px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
          </div>
        )}
      </div>

      {/*
      <div className="map-preview-grid">
        <div>
          <strong>Map Screenshot</strong>
          {value.mapScreenshotUrl ? <img alt="Map screenshot preview" src={value.mapScreenshotUrl} /> : <span><Camera size={18} />No capture</span>}
        </div>
        <div>
          <strong>Uploaded Image</strong>
          {value.uploadedImageUrl ? <img alt="Uploaded location preview" src={value.uploadedImageUrl} /> : <span><ImagePlus size={18} />No image</span>}
        </div>
      </div>
      */}

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </section>
  );
}