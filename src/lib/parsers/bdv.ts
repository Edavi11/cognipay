import { PaymentData } from "@/types/payment";
import { detectBankOrigen } from "../bankDetector";
import { parseGeneric } from "./generic";

export function parseBDV(text: string): PaymentData {
  const base = parseGeneric(text);

  // BDV suele usar número de operación de 8 dígitos en la primera línea
  if (!base.referenciaDetectada) {
    const m = text.match(/n[uú]mero\s+de\s+referencia\s+es[:\s]+(\d+)/i) ?? text.match(/\b(\d{8,12})\b/);
    if (m) {
      base.referencia = m[1];
      base.referenciaDetectada = true;
    }
  }

  // Banco origen desde instrumento origen (ej: 0102***9577)
  const origenDetectado = detectBankOrigen(text);
  base.bancoOrigen = origenDetectado ?? "Banco de Venezuela";

  return base;
}
