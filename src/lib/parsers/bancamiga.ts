import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";
import { ACCOUNT_PREFIX_MAP } from "../bankDetector";

export function parseBancamiga(text: string): PaymentData {
  const base = parseGeneric(text);

  // Referencia: "Número de referencia: 963222002"
  if (!base.referenciaDetectada) {
    const m = text.match(/n[uú]mero\s+de\s+referencia[:\s]+([0-9]{6,20})/i);
    if (m) {
      base.referencia = m[1].trim();
      base.referenciaDetectada = true;
    }
  }

  // Monto: "Monto Bs: 425.173,00" — sin paréntesis
  if (!base.montoDetectado) {
    const m = text.match(/monto\s+bs[.:)s]*\s*([0-9.,]+)/i);
    if (m) {
      base.monto = `Bs. ${m[1].trim()}`;
      base.montoDetectado = true;
    }
  }

  // Banco destino: "Cuenta a acreditar: 0172-..." → prefijo 4 dígitos
  if (!base.bancoDestinoDetectado) {
    const m = text.match(/cuenta\s+a\s+acreditar[:\s]+\(?(0[01]\d{2})/i);
    if (m) {
      const banco = ACCOUNT_PREFIX_MAP[m[1]];
      if (banco) {
        base.bancoDestino = banco;
        base.bancoDestinoDetectado = true;
      }
    }
  }

  // Concepto: Bancamiga lo llama "Concepto" pero el OCR lo destruye
  // Búsqueda fuzzy: cualquier fragmento de "concepto" de al menos 4 letras
  if (!base.conceptoDetectado) {
    const m = text.match(/(?:c[o0]nce?p?t[o0]?|oncepto|ncepto)[^a-z0-9\n]{0,5}[\s:;|]+([^\n]{2,80})/i);
    if (m) {
      // Limpia residuos OCR comunes: guiones, pipes, espacios múltiples
      const concepto = m[1].replace(/[\|\-=]{2,}/g, "").replace(/\s{2,}/g, " ").trim();
      if (concepto.length >= 2) {
        base.concepto = concepto;
        base.conceptoDetectado = true;
      }
    }
  }

  // Fecha: "19-06-2026" — Bancamiga usa guiones
  if (!base.fechaDetectada) {
    const m = text.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (m) {
      base.fecha = `${m[1]}/${m[2]}/${m[3]}`;
      base.fechaDetectada = true;
    }
  }

  base.bancoOrigen = "Bancamiga";
  return base;
}
