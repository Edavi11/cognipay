import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBanesco(text: string): PaymentData {
  const base = parseGeneric(text);

  // Referencia: "NÚMERO DE REFERENCIA\n61697616270"
  if (!base.referenciaDetectada) {
    const m = text.match(/n[uú]mero\s+de\s+referencia[:\s]*\n?([0-9]{6,20})/i);
    if (m) {
      base.referencia = m[1].trim();
      base.referenciaDetectada = true;
    }
  }

  // Concepto: "CONCEPTO\nlgbn" — Banesco pone el concepto en línea aparte
  if (!base.conceptoDetectado) {
    const m = text.match(/concepto[:\s]*\n([^\n]{1,80})/i);
    if (m) {
      base.concepto = m[1].trim();
      base.conceptoDetectado = true;
    }
  }

  base.bancoOrigen = "Banesco";
  return base;
}
