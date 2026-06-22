import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseMercantil(text: string): PaymentData {
  const base = parseGeneric(text);

  // Mercantil usa código de confirmación alfanumérico
  const refMerc = text.match(/(?:c[oó]digo|confirmaci[oó]n)[:\s]+([A-Z0-9]{6,15})/i);
  if (refMerc) base.referencia = refMerc[1];

  base.banco = "Mercantil";
  return base;
}
