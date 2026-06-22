import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBDV(text: string): PaymentData {
  const base = parseGeneric(text);

  // BDV suele mostrar número de operación de 12 dígitos
  const refBDV = text.match(/\b(\d{12})\b/);
  if (refBDV && !base.referencia) {
    base.referencia = refBDV[1];
  }

  // Nombre del titular
  const titularMatch = text.match(/(?:titular|nombre)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/i);
  if (titularMatch) {
    base.emisor = { ...base.emisor, nombre: titularMatch[1].trim() };
  }

  base.banco = "Banco de Venezuela";
  return base;
}
