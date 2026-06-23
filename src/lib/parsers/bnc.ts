import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBNC(text: string): PaymentData {
  const base = parseGeneric(text);

  // Referencia: "Referencia:\n674292903 IN" — quita el sufijo " IN", " I]", " 16", etc.
  if (!base.referenciaDetectada) {
    const m = text.match(/referencia[:\s]*\n?\s*([0-9]{6,20})/i);
    if (m) {
      base.referencia = m[1].trim();
      base.referenciaDetectada = true;
    }
  }

  // Fecha: BNC no siempre incluye fecha en el comprobante visible; S/F si no se detecta.
  // La detección genérica DD/MM/YYYY o "X de mes de YYYY" es suficiente.

  base.bancoOrigen = "Banco Nacional de Crédito";
  return base;
}
