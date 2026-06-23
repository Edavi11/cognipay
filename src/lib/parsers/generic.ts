import { PaymentData } from "@/types/payment";
import { detectBank, detectBankDestino, detectBankOrigen } from "../bankDetector";

function extractMonto(text: string): { monto: string; detectado: boolean } {
  // USD en la misma línea
  const usdMatch = text.match(/\$\s*([\d.,]+)|([\d.,]+)\s*\$|USD\s*([\d.,]+)|([\d.,]+)\s*USD/i);
  if (usdMatch) {
    const val = (usdMatch[1] || usdMatch[2] || usdMatch[3] || usdMatch[4])?.replace(/\s/g, "");
    return { monto: `${val} USD`, detectado: true };
  }

  // "Monto (Bs.):\n162.416,44" — label con paréntesis, valor en línea siguiente (Mercantil)
  const bsLabelNextLine = text.match(/monto\s*\(bs\.?\)[:\s]*\n\s*([\d.,]+)/i);
  if (bsLabelNextLine) {
    return { monto: `Bs. ${bsLabelNextLine[1].trim()}`, detectado: true };
  }

  // "BS 245.300,00" o "Bs. 162.416,44" en la misma línea
  const bsInline = text.match(/Bs\.?\s*([\d.,]+)|([\d.,]+)\s*Bs\.?/i);
  if (bsInline) {
    const val = (bsInline[1] || bsInline[2])?.replace(/\s/g, "");
    return { monto: `Bs. ${val}`, detectado: true };
  }

  // Keyword monto/total seguido de valor (misma línea o siguiente)
  const kwMatch = text.match(/(?:monto|total|importe)[:\s]+\n?\s*([\d.,]+)/i);
  if (kwMatch) {
    return { monto: `Bs. ${kwMatch[1].trim()}`, detectado: true };
  }

  return { monto: "S/M", detectado: false };
}

function extractReferencia(text: string): { ref: string; detectado: boolean } {
  const patterns = [
    // Label explícito seguido de dígitos (solo números, no palabras como "Exitosa")
    /n[uú]mero\s+de\s+referencia[:\s\n]+([0-9]{6,20})/i,
    /(?:referencia|ref\.?|comprobante|confirmaci[oó]n)[:\s#\n]+([0-9]{6,20})/i,
    // Número largo suelto como fallback
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
  // Primero busca el label en la misma línea con dos puntos
  const sameLine = text.match(/(?:concepto|descripci[oó]n|motivo)[:\s]+([^\n]{2,80})/i);
  if (sameLine) return { concepto: sameLine[1].trim(), detectado: true };

  // Banesco y otros ponen el concepto en la línea siguiente al label
  const nextLine = text.match(/(?:concepto|descripci[oó]n|motivo)\s*\n([^\n]{2,80})/i);
  if (nextLine) return { concepto: nextLine[1].trim(), detectado: true };

  return { concepto: "S/C", detectado: false };
}

export function parseGeneric(text: string): PaymentData {
  const { monto, detectado: montoDetectado } = extractMonto(text);
  const { ref: referencia, detectado: referenciaDetectada } = extractReferencia(text);
  const { fecha, detectado: fechaDetectada } = extractFecha(text);
  const { concepto, detectado: conceptoDetectado } = extractConcepto(text);

  const destinoBanco = detectBankDestino(text);
  // Instrumento origen tiene prioridad sobre keyword detector
  const bancoOrigen = detectBankOrigen(text) ?? detectBank(text);

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
