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

// Prefijos de cuenta/teléfono → banco
const ACCOUNT_PREFIX_MAP: Record<string, string> = {
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
  // "Instrumento origen: 0102***9577" — extrae prefijo del instrumento origen
  const origenInstrumento = text.match(/instrumento\s+origen[:\s]+(0[01]\d{2})/i);
  if (origenInstrumento && ACCOUNT_PREFIX_MAP[origenInstrumento[1]]) {
    return ACCOUNT_PREFIX_MAP[origenInstrumento[1]];
  }
  return null;
}

export function detectBankDestino(text: string): string | null {
  const textNorm = text.replace(/[\s\-]/g, "");

  // 1. Cruzar con cuentas de la empresa
  //    Soporta: cuenta completa, sufijo de 10 dígitos, y sufijo enmascarado de 4 dígitos
  //    Ej Banesco: "Número de cuenta ****8955" → últimos 4 de 0134-0031-85-0311158955
  for (const acc of companyAccounts) {
    const cuentaNorm = acc.cuenta.replace(/[\s\-]/g, "");

    // Cuenta completa o sufijo de 10 dígitos
    const sufijo10 = cuentaNorm.slice(-10);
    if (textNorm.includes(cuentaNorm) || textNorm.includes(sufijo10)) {
      return acc.banco;
    }

    // Sufijo enmascarado de 4 dígitos bajo el label "NÚMERO DE CUENTA"
    // Tesseract puede renderizar **** como ****, xxxx, ----  u omitirlos
    // Solo nos interesa el sufijo numérico que venga después del label destino
    const sufijo4 = cuentaNorm.slice(-4);

    // Busca "número de cuenta" (destino) seguido de cualquier cosa y luego los 4 dígitos
    const cuentaDestinoBlock = text.match(
      /n[uú]mero\s+de\s+cuenta[\s\S]{0,30}?(\d{4})/i
    );
    if (cuentaDestinoBlock && cuentaDestinoBlock[1] === sufijo4) {
      return acc.banco;
    }

    // Fallback: los 4 dígitos aparecen después de cualquier secuencia de enmascaramiento
    // [*x\-\.]{2,} cubre ****, xxxx, ----, ....
    const maskedPattern = new RegExp(`[*x\\-\\.]{2,}\\s*${sufijo4}\\b`, "i");
    if (maskedPattern.test(text)) {
      return acc.banco;
    }
  }

  // 2. "Instrumento destino: 0114****65327" — los primeros 4 dígitos = banco destino
  const instrumentoDestino = text.match(/instrumento\s+destino[:\s]+(0[01]\d{2})/i);
  if (instrumentoDestino) {
    const banco = ACCOUNT_PREFIX_MAP[instrumentoDestino[1]];
    if (banco) return banco;
  }

  // 3. "Banco: BANCARIBE" — aparece en BDV junto al instrumento destino
  const bancoExplicito = text.match(/^banco[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)$/im);
  if (bancoExplicito) {
    const found = detectBankFromName(bancoExplicito[1].trim());
    if (found) return found;
  }

  // 4. Número de cuenta con prefijo en cualquier parte del texto (puede estar enmascarado)
  const accountMatch = text.match(/\b(0[01]\d{2})[\*\d]{4,}/);
  if (accountMatch) {
    const banco = ACCOUNT_PREFIX_MAP[accountMatch[1]];
    if (banco) return banco;
  }

  // 5. Patrones explícitos de banco destino en texto libre
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
