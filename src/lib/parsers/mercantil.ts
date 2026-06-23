import { PaymentData } from "@/types/payment";
import { detectBankDestino } from "../bankDetector";
import { parseGeneric } from "./generic";

export function parseMercantil(text: string): PaymentData {
  const base = parseGeneric(text);

  // Referencia: "Nro. de referencia:\n0047900083890"
  if (!base.referenciaDetectada) {
    const m = text.match(/nro\.?\s*de\s*referencia[:\s]*\n?\s*([0-9]{6,20})/i);
    if (m) {
      base.referencia = m[1].trim();
      base.referenciaDetectada = true;
    }
  }

  // Fecha: "Fecha y hora de envio:\n22/6/2026 ..."
  if (!base.fechaDetectada) {
    const m = text.match(/fecha[^:\n]*:[:\s]*\n?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (m) {
      const [d, mo, y] = m[1].split("/");
      base.fecha = `${d.padStart(2, "0")}/${mo.padStart(2, "0")}/${y}`;
      base.fechaDetectada = true;
    }
  }

  // Concepto: "Concepto:\nReinco 178397"
  if (!base.conceptoDetectado) {
    const m = text.match(/concepto[:\s]*\n?\s*([^\n]{2,80})/i);
    if (m) {
      base.concepto = m[1].trim();
      base.conceptoDetectado = true;
    }
  }

  // Banco destino: Tpago "Banco destino:\n0102 - Banco De Venezuela..."
  if (!base.bancoDestinoDetectado) {
    const destinoTpago = text.match(/banco\s+destino[:\s]*\n?\s*(0[01]\d{2})\s*-\s*([^\n]+)/i);
    if (destinoTpago) {
      const banco = detectBankDestino(`banco destino: ${destinoTpago[1]} - ${destinoTpago[2]}`);
      if (banco) {
        base.bancoDestino = banco;
        base.bancoDestinoDetectado = true;
      }
    }
  }

  // Banco destino desde beneficiario: "Reinco*1223" → sufijo *1223
  // El asterisco separa el nombre del sufijo de cuenta
  if (!base.bancoDestinoDetectado) {
    const benefMatch = text.match(/beneficiario[:\s]*\n?\s*([^\n]+)/i);
    if (benefMatch) {
      const benefLine = benefMatch[1];
      // Extrae sufijo después de * : "Reinco*1223" → "1223"
      const sufijoCuenta = benefLine.match(/\*(\d{4})/);
      if (sufijoCuenta) {
        const sufijo = sufijoCuenta[1];
        // Inyecta un texto simulado con el sufijo para que el detector lo encuentre
        const fakeText = `NÚMERO DE CUENTA ****${sufijo}`;
        const banco = detectBankDestino(fakeText);
        if (banco) {
          base.bancoDestino = banco;
          base.bancoDestinoDetectado = true;
        }
      }
    }
  }

  base.bancoOrigen = "Mercantil";
  return base;
}
