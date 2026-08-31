const MAX_IMAGE_BYTES = 1_350_000;
const MIN_QUALITY = 0.55;
const START_QUALITY = 0.86;
const MAX_DIMENSION = 1600;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Cannot read image file"));
    image.src = dataUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Cannot compress image"));
      },
      type,
      quality,
    );
  });
}

function getScaledSize(width, height, maxDimension) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / longestSide;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function blobToFile(blob, originalFile) {
  const extension = blob.type === "image/png" ? "png" : "jpg";
  const baseName = originalFile.name.replace(/\.[^.]+$/, "") || "document";
  return new File([blob], `${baseName}-compressed.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export async function compressImageForOcr(file) {
  if (file.size <= MAX_IMAGE_BYTES) return file;

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  let maxDimension = MAX_DIMENSION;
  let quality = START_QUALITY;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { width, height } = getScaledSize(
      image.naturalWidth,
      image.naturalHeight,
      maxDimension,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob.size <= MAX_IMAGE_BYTES || quality <= MIN_QUALITY) {
      return blobToFile(blob, file);
    }

    quality -= 0.08;
    if (quality < MIN_QUALITY) {
      quality = START_QUALITY;
      maxDimension = Math.round(maxDimension * 0.82);
    }
  }

  throw new Error("รูปภาพใหญ่เกินไป กรุณาถ่ายใหม่ให้ชัดและใกล้ขึ้น");
}
