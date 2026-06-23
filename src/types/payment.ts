export interface PaymentData {
  bancoOrigen: string;
  bancoDestino: string;
  bancoDestinoDetectado: boolean;
  referencia: string;
  referenciaDetectada: boolean;
  monto: string;
  montoDetectado: boolean;
  fecha: string;
  fechaDetectada: boolean;
  concepto: string;
  conceptoDetectado: boolean;
  rawText?: string;
}
