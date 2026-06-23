import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBanesco(text: string): PaymentData {
  const base = parseGeneric(text);

  // Banesco usa referencia de 9 dígitos cuando el parser genérico no la encontró
  if (!base.referenciaDetectada) {
    const m = text.match(/\b(\d{9})\b/);
    if (m) {
      base.referencia = m[1];
      base.referenciaDetectada = true;
    }
  }

  base.bancoOrigen = "Banesco";
  return base;
}
