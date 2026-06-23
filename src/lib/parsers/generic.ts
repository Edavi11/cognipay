import { PaymentData } from "@/types/payment";
import { detectBank, detectBankDestino } from "../bankDetector";

function extractMonto(text: string): { monto: string; detectado: boolean } {
  // USD → convertir indicando que es USD (no tenemos tasa, devolvemos el valor con nota)
  const usdMatch = text.match(/\$\s*([\d.,]+)|([\d.,]+)\s*\$|USD\s*([\d.,]+)|([\d.,]+)\s*USD/i);
  if (usdMatch) {
    const val = (usdMatch[1] || usdMatch[2] || usdMatch[3] || usdMatch[4])?.replace(/\s/g, "");
    return { monto: `${val} USD`, detectado: true };
  }

  // Bs con símbolo
  const bsMatch = text.match(/Bs\.?\s*([\d.,]+)|([\d.,]+)\s*Bs\.?/i);
  if (bsMatch) {
    const val = (bsMatch[1] || bsMatch[2])?.replace(/\s/g, "");
    return { monto: `Bs. ${val}`, detectado: true };
  }

  // Palabra clave monto/total
  const kwMatch = text.match(/(?:monto|total|importe)[:\s]+([\d.,]+)/i);
  if (kwMatch) {
    return { monto: `Bs. ${kwMatch[1]}`, detectado: true };
  }

  return { monto: "S/M", detectado: false };
}

function extractReferencia(text: string): { ref: string; detectado: boolean } {
  const patterns = [
    /(?:n[uú]mero\s+de\s+)?(?:referencia|ref\.?|comprobante|confirmaci[oó]n|operaci[oó]n|n[uú]mero)[:\s#]+([A-Z0-9\-]{6,20})/i,
    /\b([0-9]{8,20})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return { ref: m[1].trim(), detectado: true };
  }
  return { ref: "S/R", detectado: false };
}

function extractFecha(text: string): { fecha: string; detectado: boolean } {
  // DD/MM/YYYY o DD-MM-YYYY
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    return {
      fecha: `${d.padStart(2, "0")}/${mo.padStart(2, "0")}/${year}`,
      detectado: true,
    };
  }

  // Fecha en texto: "22 de junio de 2026"
  const MESES: Record<string, string> = {
    enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
    julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
  };
  const textoMatch = text.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (textoMatch) {
    const mes = MESES[textoMatch[2].toLowerCase()];
    if (mes) {
      return {
        fecha: `${textoMatch[1].padStart(2, "0")}/${mes}/${textoMatch[3]}`,
        detectado: true,
      };
    }
  }

  return { fecha: "S/F", detectado: false };
}

function extractConcepto(text: string): { concepto: string; detectado: boolean } {
  const m = text.match(/(?:concepto|descripci[oó]n|motivo|por)[:\s]+([^\n]{3,80})/i);
  if (m) return { concepto: m[1].trim(), detectado: true };
  return { concepto: "S/C", detectado: false };
}

export function parseGeneric(text: string): PaymentData {
  const { monto, detectado: montoDetectado } = extractMonto(text);
  const { ref: referencia, detectado: referenciaDetectada } = extractReferencia(text);
  const { fecha, detectado: fechaDetectada } = extractFecha(text);
  const { concepto, detectado: conceptoDetectado } = extractConcepto(text);

  const destinoBanco = detectBankDestino(text);
  const bancoOrigen = detectBank(text);

  return {
    bancoOrigen,
    bancoDestino: destinoBanco ?? "S/D",
    bancoDestinoDetectado: destinoBanco !== null,
    referencia,
    referenciaDetectada,
    monto,
    montoDetectado,
    fecha,
    fechaDetectada,
    concepto,
    conceptoDetectado,
    rawText: text,
  };
}
