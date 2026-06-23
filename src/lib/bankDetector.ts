import banks from "../../banks.json";
import companyAccounts from "../../company_accounts.json";

const BANK_KEYWORDS: Record<string, string[]> = {
  "Banesco": ["banesco"],
  "Banco de Venezuela": ["banco de venezuela", "bdv"],
  "Mercantil": ["mercantil"],
  "BBVA Provincial": ["provincial", "bbva"],
  "Banco Nacional de Crédito": ["bnc", "banco nacional de credito", "banco nacional de crédito"],
  "Bancamiga": ["bancamiga"],
  "Bancaribe": ["bancaribe"],
  "Banco Exterior": ["banco exterior", "exterior"],
  "Banco del Tesoro": ["banco del tesoro", "tesoro"],
  "Banplus": ["banplus"],
  "100% Banco": ["100% banco", "cien por ciento banco"],
  "Mi Banco": ["mi banco"],
  "Banco Activo": ["banco activo"],
  "BFC Banco Fondo Común": ["bfc", "fondo comun", "fondo común"],
  "Bancrecer": ["bancrecer"],
  "Banco Agrícola": ["agricola", "agrícola"],
  "DelSur": ["delsur", "del sur"],
  "Banco Caroní": ["caroni", "caroní"],
};

export const ACCOUNT_PREFIX_MAP: Record<string, string> = {
  "0102": "Banco de Venezuela",
  "0104": "Venezolano de Crédito",
  "0105": "Mercantil",
  "0108": "BBVA Provincial",
  "0114": "Bancaribe",
  "0115": "Banco Exterior",
  "0128": "Banco Caroní",
  "0134": "Banesco",
  "0137": "Banco Sofitasa",
  "0138": "Banco Plaza",
  "0146": "Bangente",
  "0151": "BFC Banco Fondo Común",
  "0156": "100% Banco",
  "0157": "DelSur",
  "0163": "Banco del Tesoro",
  "0166": "Banco Agrícola",
  "0168": "Bancrecer",
  "0169": "Mi Banco",
  "0171": "Banco Activo",
  "0172": "Bancamiga",
  "0173": "Banco Internacional de Desarrollo",
  "0174": "Banplus",
  "0007": "Banco Digital de Los Trabajadores",
  "0177": "BANAVIH / FANB",
  "0178": "N58 Banco Digital",
  "0191": "Banco Nacional de Crédito",
  "0601": "Instituto Municipal de Crédito Popular",
};

export function detectBank(text: string): string {
  const lower = text.toLowerCase();

  // Mercantil Tpago: el comprobante menciona el banco destino, no el origen
  if (/\btpago\b/i.test(text) || /tu\s+tpago\s+fue\s+exitoso/i.test(text)) {
    return "Mercantil";
  }

  // BNC pago móvil: "Cta. Corriente BNC:" identifica el banco origen como BNC
  // Debe ir antes del loop porque "mercantil" o "banesco" pueden aparecer como banco destino
  if (/cta\.\s*corriente\s+bnc\b/i.test(text) || /su\s+pago\s+m[oó]vil\s+ha\s+sido\s+ejecutado/i.test(text)) {
    return "Banco Nacional de Crédito";
  }

  for (const [bankName, keywords] of Object.entries(BANK_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return bankName;
    }
  }

  for (const bank of banks) {
    const words = bank.nombre.toLowerCase().split(" ").filter((w) => w.length > 4);
    for (const word of words) {
      if (lower.includes(word)) return bank.nombre;
    }
  }

  return "Desconocido";
}

export function detectBankOrigen(text: string): string | null {
  // BNC pago móvil — debe ir primero porque "mercantil" o "banesco" pueden
  // aparecer en el texto como banco destino del beneficiario
  if (/cta\.\s*corriente\s+bnc\b/i.test(text) || /su\s+pago\s+m[oó]vil\s+ha\s+sido\s+ejecutado/i.test(text)) {
    return "Banco Nacional de Crédito";
  }

  const origenInstrumento = text.match(/instrumento\s+origen[:\s]+(0[01]\d{2})/i);
  if (origenInstrumento && ACCOUNT_PREFIX_MAP[origenInstrumento[1]]) {
    return ACCOUNT_PREFIX_MAP[origenInstrumento[1]];
  }

  // BDV empresas: "Instrumento 0102***9577\norigen:"
  const instrumentoAntesOrigen = text.match(/instrumento\s+(0[01]\d{2})[\*'"=\d\s]*\n\s*origen/i);
  if (instrumentoAntesOrigen && ACCOUNT_PREFIX_MAP[instrumentoAntesOrigen[1]]) {
    return ACCOUNT_PREFIX_MAP[instrumentoAntesOrigen[1]];
  }

  return null;
}


export function detectBankDestino(text: string): string | null {
  const textNorm = text.replace(/[\s\-]/g, "");
  const lower = text.toLowerCase();

  // 1. Cuenta completa o sufijo de 10 dígitos en el texto normalizado
  for (const acc of companyAccounts) {
    const cuentaNorm = acc.cuenta.replace(/[\s\-]/g, "");
    const sufijo10 = cuentaNorm.slice(-10);
    if (textNorm.includes(cuentaNorm) || textNorm.includes(sufijo10)) {
      return acc.banco;
    }
  }

  // 2. Sufijo de 4 dígitos bajo el label "NÚMERO DE CUENTA"
  //    Busca los primeros 4 dígitos consecutivos en los 60 chars después del label
  const cuentaBlock = text.match(/n[uú]mero\s+de\s+cuenta[\s\S]{0,60}/i);
  if (cuentaBlock) {
    const digits = cuentaBlock[0].match(/\d{4}/g);
    if (digits) {
      for (const d of digits) {
        for (const acc of companyAccounts) {
          if (acc.cuenta.endsWith(d)) return acc.banco;
        }
      }
    }
  }

  // 3. Sufijo enmascarado con cualquier carácter: ****8955, xxxx8955, ----8955
  for (const acc of companyAccounts) {
    const sufijo4 = acc.cuenta.slice(-4);
    const maskedPattern = new RegExp(`[*x\\-\\.]{2,}\\s*${sufijo4}\\b`, "i");
    if (maskedPattern.test(text)) return acc.banco;
  }

  // 4. "Cuenta a acreditar: 0172-..." — Bancamiga y otros
  const cuentaAcreditar = text.match(/cuenta\s+a\s+acreditar[:\s]+\(?(0[01]\d{2})/i);
  if (cuentaAcreditar) {
    const banco = ACCOUNT_PREFIX_MAP[cuentaAcreditar[1]];
    if (banco) return banco;
  }

  // "Instrumento destino: 0114****65327" — prefijo del instrumento
  const instrumentoDestino = text.match(/instrumento\s+destino[:\s]+(0[01]\d{2})/i);
  if (instrumentoDestino) {
    const banco = ACCOUNT_PREFIX_MAP[instrumentoDestino[1]];
    if (banco) return banco;
  }

  // BDV empresas: "Instrumento 0114****65377\ndestino:"
  const instrumentoAntesDestino = text.match(/instrumento\s+(0[01]\d{2})[\*'"=\d\s]*\n\s*destino/i);
  if (instrumentoAntesDestino) {
    const banco = ACCOUNT_PREFIX_MAP[instrumentoAntesDestino[1]];
    if (banco) return banco;
  }

  // Mercantil Tpago: "Banco destino:\n0102 - Banco De Venezuela..."
  const bancoDestinoCodigo = text.match(/banco\s+destino[:\s]*\n?\s*(0[01]\d{2})\s*-\s*([^\n]+)/i);
  if (bancoDestinoCodigo) {
    const banco =
      ACCOUNT_PREFIX_MAP[bancoDestinoCodigo[1]] ??
      detectBankFromName(bancoDestinoCodigo[2].trim());
    if (banco) return banco;
  }

  // 5a. "Banco: 0138 - BANCO PLAZA" — BDV PagomóvilBDV y similares
  const bancoConCodigo = text.match(/^banco[:\s]+(0[01]\d{2})\s*-\s*([^\n]+)/im);
  if (bancoConCodigo) {
    const banco =
      ACCOUNT_PREFIX_MAP[bancoConCodigo[1]] ??
      detectBankFromName(bancoConCodigo[2].trim());
    if (banco) return banco;
  }

  // 5b. Banesco/Banplus PagoMóvil: "BANCO RECEPTOR\nBANESCO BANCO UNIVERSAL"
  const bancoReceptor = text.match(/banco\s+receptor[:\s]*\r?\n([^\n]+)/i);
  if (bancoReceptor) {
    const banco = detectBankFromName(bancoReceptor[1].trim());
    if (banco) return banco;
  }

  // 5c. BNC pago móvil — beneficiario con código explícito: "- 0134 -\nBanesco"
  const benefConCodigo = text.match(
    /beneficiario[:\s]*\r?\n[^\n]+-\s*(0[01]\d{2})\s*-\s*\r?\n([^\n]+)/i
  );
  if (benefConCodigo) {
    const banco =
      ACCOUNT_PREFIX_MAP[benefConCodigo[1]] ??
      detectBankFromName(benefConCodigo[2].trim());
    if (banco) return banco;
  }

  // 5d. BNC pago móvil — beneficiario sin código, banco en línea siguiente: "- \nMERCANTIL"
  const benefSinCodigo = text.match(/beneficiario[:\s]*\r?\n[^\n]+-\s*\r?\n([^\n]+)/i);
  if (benefSinCodigo) {
    const banco = detectBankFromName(benefSinCodigo[1].trim());
    if (banco) return banco;
  }

  // 5e. "Banco: BANCARIBE" explícito (nombre sin código)
  const bancoExplicito = text.match(/^banco[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)$/im);
  if (bancoExplicito) {
    const found = detectBankFromName(bancoExplicito[1].trim());
    if (found) return found;
  }

  // 6. Prefijo de cuenta 01XX en cualquier parte del texto
  const accountMatch = text.match(/\b(0[01]\d{2})[\*\d]{4,}/);
  if (accountMatch) {
    const banco = ACCOUNT_PREFIX_MAP[accountMatch[1]];
    if (banco) return banco;
  }

  // 7. Patrones explícitos en texto libre
  const destinoPatterns = [
    /banco\s+destino[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
    /destino[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
    /hacia\s+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
  ];
  for (const pattern of destinoPatterns) {
    const m = text.match(pattern);
    if (m) {
      const found = detectBankFromName(m[1].trim());
      if (found) return found;
    }
  }

  return null;
}

function detectBankFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [bankName, keywords] of Object.entries(BANK_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return bankName;
    }
  }
  return null;
}
