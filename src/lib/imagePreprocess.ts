"use client";

const TARGET_WIDTH = 1200; // escala mínima para que Tesseract lea bien
const CONTRAST = 1.6;      // multiplicador de contraste
const BRIGHTNESS = 10;     // offset de brillo
const THRESHOLD = 140;     // umbral para binarización (0-255)

/**
 * Preprocesa una imagen antes de pasarla a Tesseract:
 * 1. Escala a al menos TARGET_WIDTH px de ancho
 * 2. Convierte a escala de grises
 * 3. Aplica contraste + brillo
 * 4. Binariza (blanco/negro) para maximizar legibilidad de texto
 *
 * Retorna un Blob PNG listo para Tesseract.
 */
export async function preprocessImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.max(1, TARGET_WIDTH / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

  // Fondo blanco antes de dibujar (evita transparencias oscuras)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Escala de grises (luminancia perceptual)
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    // Contraste + brillo
    const adjusted = Math.min(255, Math.max(0, CONTRAST * (gray - 128) + 128 + BRIGHTNESS));

    // Binarización: texto oscuro sobre fondo blanco
    const binary = adjusted < THRESHOLD ? 0 : 255;

    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
    // alpha se mantiene
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.convertToBlob({ type: "image/png" });
}
