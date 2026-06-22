export type PaymentType = "pago_movil" | "transferencia" | "zelle" | "deposito" | "desconocido";
export type Currency = "Bs" | "USD" | "desconocido";

export interface PaymentParty {
  nombre?: string;
  cedula?: string;
  telefono?: string;
  banco?: string;
}

export interface PaymentData {
  banco: string;
  tipo: PaymentType;
  referencia?: string;
  fecha?: string;
  hora?: string;
  monto?: string;
  moneda: Currency;
  emisor?: PaymentParty;
  receptor?: PaymentParty;
  concepto?: string;
  rawText?: string;
}
