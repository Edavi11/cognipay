"use client";

import { useState } from "react";
import { PaymentData } from "@/types/payment";

interface Props {
  data: PaymentData;
  imageUrl: string | null;
}

export default function PaymentResult({ data, imageUrl }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [edited, setEdited] = useState<PaymentData>(data);

  const copy = async (text: string, field: string) => {
    if (text.startsWith("S/")) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const lines = [
      `Banco Origen: ${edited.bancoOrigen}`,
      `Banco Destino: ${edited.bancoDestino}`,
      `Referencia: ${edited.referencia}`,
      `Monto: ${edited.monto}`,
      `Fecha: ${edited.fecha}`,
      `Concepto: ${edited.concepto}`,
    ].join("\n");
    await navigator.clipboard.writeText(lines);
    setCopiedField("all");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const update = (field: keyof PaymentData, value: string) => {
    setEdited((prev) => ({ ...prev, [field]: value }));
  };

  const allDetected =
    edited.bancoDestinoDetectado &&
    edited.referenciaDetectada &&
    edited.montoDetectado &&
    edited.fechaDetectada &&
    edited.conceptoDetectado;

  return (
    <div className="space-y-4">
      {/* Banner estado general */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${allDetected ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800"}`}>
        <span className="text-2xl">{allDetected ? "✅" : "⚠️"}</span>
        <div>
          <p className={`font-bold ${allDetected ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"}`}>
            {edited.bancoOrigen}
          </p>
          <p className={`text-sm ${allDetected ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
            {allDetected ? "Todos los campos detectados" : "Algunos campos requieren revisión manual"}
          </p>
        </div>
      </div>

      {/* Tabla de 5 campos estándar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos del comprobante</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Field
            label="Banco Origen"
            value={edited.bancoOrigen}
            field="bancoOrigen"
            detected={true}
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => update("bancoOrigen", v)}
          />
          <Field
            label="Banco Destino"
            value={edited.bancoDestino}
            field="bancoDestino"
            detected={edited.bancoDestinoDetectado}
            undetectedHint="No se pudo determinar el banco destino"
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => {
              update("bancoDestino", v);
              setEdited((p) => ({ ...p, bancoDestinoDetectado: true }));
            }}
          />
          <Field
            label="Referencia"
            value={edited.referencia}
            field="referencia"
            detected={edited.referenciaDetectada}
            undetectedHint="No se encontró número de referencia"
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => {
              update("referencia", v);
              setEdited((p) => ({ ...p, referenciaDetectada: true }));
            }}
            highlight
          />
          <Field
            label="Monto"
            value={edited.monto}
            field="monto"
            detected={edited.montoDetectado}
            undetectedHint="No se pudo extraer el monto"
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => {
              update("monto", v);
              setEdited((p) => ({ ...p, montoDetectado: true }));
            }}
            highlight
          />
          <Field
            label="Fecha"
            value={edited.fecha}
            field="fecha"
            detected={edited.fechaDetectada}
            undetectedHint="No se encontró la fecha"
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => {
              update("fecha", v);
              setEdited((p) => ({ ...p, fechaDetectada: true }));
            }}
          />
          <Field
            label="Concepto"
            value={edited.concepto}
            field="concepto"
            detected={edited.conceptoDetectado}
            undetectedHint="No se encontró el concepto"
            copiedField={copiedField}
            onCopy={copy}
            onChange={(v) => {
              update("concepto", v);
              setEdited((p) => ({ ...p, conceptoDetectado: true }));
            }}
          />
        </div>
      </div>

      {/* Copiar todo */}
      <button
        onClick={copyAll}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
          copiedField === "all"
            ? "bg-green-500 text-white"
            : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
        }`}
      >
        {copiedField === "all" ? "✅ ¡Copiado!" : "📋 Copiar todo"}
      </button>

      {/* Imagen original */}
      {imageUrl && (
        <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer select-none">
            Ver imagen original
          </summary>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Comprobante original" className="w-full object-contain max-h-72 border-t border-gray-100 dark:border-gray-800" />
        </details>
      )}

      {/* Texto crudo */}
      {data.rawText && (
        <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer select-none">
            Ver texto extraído (raw)
          </summary>
          <pre className="p-4 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words border-t border-gray-100 dark:border-gray-800 font-mono max-h-48 overflow-y-auto">
            {data.rawText}
          </pre>
        </details>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  field: string;
  detected: boolean;
  undetectedHint?: string;
  highlight?: boolean;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  onChange: (value: string) => void;
}

function Field({ label, value, field, detected, undetectedHint, highlight, copiedField, onCopy, onChange }: FieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const copied = copiedField === field;
  const missing = !detected;

  const handleSave = () => {
    onChange(editValue);
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 ${missing ? "bg-red-50/60 dark:bg-red-950/20" : highlight ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            {missing && (
              <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-semibold">
                No detectado
              </span>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 text-sm border border-blue-300 rounded-lg px-2 py-1.5 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
              />
              <button onClick={handleSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold">OK</button>
              <button onClick={() => setEditing(false)} className="text-xs text-gray-500 px-2">✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing(true); setEditValue(value); }}
              className={`text-sm font-semibold text-left w-full ${
                missing
                  ? "text-red-500 dark:text-red-400 italic"
                  : highlight
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {value}
            </button>
          )}

          {missing && undetectedHint && !editing && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 italic">{undetectedHint} — toca para editar</p>
          )}
        </div>

        {/* Botón copiar — deshabilitado si no fue detectado */}
        <button
          onClick={() => onCopy(value, field)}
          disabled={missing}
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors mt-0.5 ${
            missing
              ? "bg-gray-100 dark:bg-gray-800 opacity-30 cursor-not-allowed"
              : copied
              ? "bg-green-100 dark:bg-green-900"
              : "bg-gray-100 dark:bg-gray-800 active:bg-blue-100 dark:active:bg-blue-900"
          }`}
          title={missing ? "Sin valor para copiar" : `Copiar ${label}`}
        >
          {copied ? "✅" : "📋"}
        </button>
      </div>
    </div>
  );
}
