import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseMercantil(text: string): PaymentData {
  const base = parseGeneric(text);

  // Mercantil usa código de confirmación alfanumérico
  if (!base.referenciaDetectada) {
    const m = text.match(/(?:c[oó]digo|confirmaci[oó]n)[:\s]+([A-Z0-9]{6,15})/i);
    if (m) {
      base.referencia = m[1];
      base.referenciaDetectada = true;
    }
  }

  base.bancoOrigen = "Mercantil";
  return base;
}
