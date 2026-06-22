import { PaymentData } from "@/types/payment";
import { parseGeneric } from "./generic";

export function parseBanesco(text: string): PaymentData {
  const base = parseGeneric(text);

  // Banesco pago móvil: referencia de 9 dígitos
  const refBanesco = text.match(/\b(\d{9})\b/);
  if (refBanesco && !base.referencia) {
    base.referencia = refBanesco[1];
  }

  // Nombre del receptor en pagos Banesco
  const receptorMatch = text.match(/(?:beneficiario|receptor|a favor de)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/i);
  if (receptorMatch) {
    base.receptor = { ...base.receptor, nombre: receptorMatch[1].trim() };
  }

  base.banco = "Banesco";
  return base;
}
