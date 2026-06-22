import { PaymentData } from "@/types/payment";
import { detectBank } from "./bankDetector";
import { parseGeneric } from "./parsers/generic";
import { parseBanesco } from "./parsers/banesco";
import { parseBDV } from "./parsers/bdv";
import { parseMercantil } from "./parsers/mercantil";

export function parsePayment(text: string): PaymentData {
  const bank = detectBank(text);

  if (bank === "Banesco") return parseBanesco(text);
  if (bank === "Banco de Venezuela") return parseBDV(text);
  if (bank === "Mercantil") return parseMercantil(text);

  return parseGeneric(text);
}
