import banks from "../../banks.json";

const BANK_KEYWORDS: Record<string, string[]> = {
  "Banesco": ["banesco"],
  "Banco de Venezuela": ["banco de venezuela", "bdv"],
  "Mercantil": ["mercantil"],
  "BBVA Provincial": ["provincial", "bbva"],
  "Banco Nacional de Crédito": ["bnc", "banco nacional de credito", "banco nacional de crédito"],
  "Bancamiga": ["bancamiga"],
  "Bancaribe": ["bancaribe"],
  "Banco Exterior": ["exterior"],
  "Banco del Tesoro": ["tesoro"],
  "Banplus": ["banplus"],
  "100% Banco": ["100% banco", "cien por ciento banco"],
  "Mi Banco": ["mi banco"],
  "Banco Activo": ["banco activo"],
};

export function detectBank(text: string): string {
  const lower = text.toLowerCase();

  for (const [bankName, keywords] of Object.entries(BANK_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return bankName;
    }
  }

  for (const bank of banks) {
    const nameLower = bank.nombre.toLowerCase();
    const words = nameLower.split(" ").filter((w) => w.length > 4);
    for (const word of words) {
      if (lower.includes(word)) return bank.nombre;
    }
  }

  return "Banco desconocido";
}
