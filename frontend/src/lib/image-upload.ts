export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export async function optimizeImageFile(file: File, options: OptimizeImageOptions = {}): Promise<File> {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.88,
    mimeType = "image/webp",
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const bitmap = await createImageBitmap(file);

  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const targetWidth = Math.max(1, Math.round(bitmap.width * ratio));
  const targetHeight = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Cannot process image");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = "contrast(1.04) saturate(1.05)";
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to optimize image"));
          return;
        }
        resolve(result);
      },
      mimeType,
      quality,
    );
  });

  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${baseName}.${extension}`, { type: mimeType });
}
