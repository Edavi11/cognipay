import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBDV(text: string): PaymentData {
  const base = parseGeneric(text);

  // BDV suele usar número de operación de 12 dígitos
  if (!base.referenciaDetectada) {
    const m = text.match(/\b(\d{12})\b/);
    if (m) {
      base.referencia = m[1];
      base.referenciaDetectada = true;
    }
  }

  base.bancoOrigen = "Banco de Venezuela";
  return base;
}
