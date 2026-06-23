import banks from "../../banks.json";

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

export function detectBankDestino(text: string): string | null {
  // Buscar cuenta destino con prefijo (ej: 0134-xxxx o 01340000...)
  const accountMatch = text.match(/\b(0[01]\d{2})[- ]?\d{4}/);
  if (accountMatch) {
    const prefix = accountMatch[1];
    if (ACCOUNT_PREFIX_MAP[prefix]) return ACCOUNT_PREFIX_MAP[prefix];
  }

  // Buscar patrones explícitos de banco destino
  const destinoPatterns = [
    /banco\s+destino[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
    /destino[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
    /hacia\s+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:\n|$|,)/i,
  ];

  for (const pattern of destinoPatterns) {
    const m = text.match(pattern);
    if (m) {
      const candidato = m[1].trim();
      // Verificar que el candidato coincida con algún banco conocido
      const found = detectBankFromName(candidato);
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
