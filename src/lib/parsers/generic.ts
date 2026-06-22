import { PaymentData, PaymentType, Currency } from "@/types/payment";
import { detectBank } from "../bankDetector";

function extractMonto(text: string): { monto?: string; moneda: Currency } {
  // USD patterns
  const usdMatch = text.match(/\$\s*([\d.,]+)|USD\s*([\d.,]+)|([\d.,]+)\s*USD/i);
  if (usdMatch) {
    const val = usdMatch[1] || usdMatch[2] || usdMatch[3];
    return { monto: val?.replace(",", "."), moneda: "USD" };
  }

  // Bolivares patterns
  const bsMatch = text.match(/Bs\.?\s*([\d.,]+)|([\d.,]+)\s*Bs\.?/i);
  if (bsMatch) {
    const val = bsMatch[1] || bsMatch[2];
    return { monto: val, moneda: "Bs" };
  }

  // Generic large number (likely monto)
  const montoMatch = text.match(/(?:monto|total|importe)[:\s]+([\d.,]+)/i);
  if (montoMatch) return { monto: montoMatch[1], moneda: "Bs" };

  return { moneda: "desconocido" };
}

function extractReferencia(text: string): string | undefined {
  const patterns = [
    /(?:n[uú]mero\s+de\s+)?(?:referencia|ref\.?|comprobante|confirmaci[oó]n|operaci[oó]n)[:\s#]+([A-Z0-9\-]{6,20})/i,
    /\b([0-9]{8,20})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return undefined;
}

function extractFecha(text: string): { fecha?: string; hora?: string } {
  // DD/MM/YYYY or DD-MM-YYYY
  const fechaMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  // HH:MM or HH:MM:SS
  const horaMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/);

  return {
    fecha: fechaMatch ? fechaMatch[0] : undefined,
    hora: horaMatch ? horaMatch[1].trim() : undefined,
  };
}

function extractTelefono(text: string): string | undefined {
  const m = text.match(/(?:04[012456789][0-9][-\s]?[0-9]{3}[-\s]?[0-9]{4})/);
  return m ? m[0].replace(/[\s\-]/g, "") : undefined;
}

function extractCedula(text: string): string | undefined {
  const m = text.match(/[VEve]-?\s*(\d{6,9})/);
  return m ? m[0].replace(/\s/g, "") : undefined;
}

function detectTipo(text: string): PaymentType {
  const lower = text.toLowerCase();
  if (lower.includes("pago m") || lower.includes("pago movil") || lower.includes("pago móvil")) return "pago_movil";
  if (lower.includes("transferencia")) return "transferencia";
  if (lower.includes("zelle")) return "zelle";
  if (lower.includes("dep") && lower.includes("sito")) return "deposito";
  return "desconocido";
}

export function parseGeneric(text: string): PaymentData {
  const { monto, moneda } = extractMonto(text);
  const { fecha, hora } = extractFecha(text);
  const referencia = extractReferencia(text);
  const telefono = extractTelefono(text);
  const cedula = extractCedula(text);

  const conceptoMatch = text.match(/(?:concepto|descripci[oó]n|motivo)[:\s]+([^\n]+)/i);

  return {
    banco: detectBank(text),
    tipo: detectTipo(text),
    referencia,
    fecha,
    hora,
    monto,
    moneda,
    emisor: { telefono, cedula },
    concepto: conceptoMatch ? conceptoMatch[1].trim() : undefined,
    rawText: text,
  };
}
