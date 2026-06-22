"use client";

import { useState } from "react";
import { PaymentData } from "@/types/payment";

interface Props {
  data: PaymentData;
  imageUrl: string | null;
}

const TIPO_LABEL: Record<string, string> = {
  pago_movil: "Pago Móvil",
  transferencia: "Transferencia",
  zelle: "Zelle",
  deposito: "Depósito",
  desconocido: "Pago",
};

export default function PaymentResult({ data, imageUrl }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [editedData, setEditedData] = useState<PaymentData>(data);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const lines = [
      `Banco: ${editedData.banco}`,
      `Tipo: ${TIPO_LABEL[editedData.tipo] ?? editedData.tipo}`,
      editedData.referencia ? `Referencia: ${editedData.referencia}` : null,
      editedData.fecha ? `Fecha: ${editedData.fecha}` : null,
      editedData.hora ? `Hora: ${editedData.hora}` : null,
      editedData.monto ? `Monto: ${editedData.monto} ${editedData.moneda}` : null,
      editedData.emisor?.nombre ? `Emisor: ${editedData.emisor.nombre}` : null,
      editedData.emisor?.cedula ? `Cédula: ${editedData.emisor.cedula}` : null,
      editedData.emisor?.telefono ? `Teléfono: ${editedData.emisor.telefono}` : null,
      editedData.receptor?.nombre ? `Receptor: ${editedData.receptor.nombre}` : null,
      editedData.receptor?.banco ? `Banco receptor: ${editedData.receptor.banco}` : null,
      editedData.concepto ? `Concepto: ${editedData.concepto}` : null,
    ].filter(Boolean).join("\n");

    await copyToClipboard(lines, "all");
  };

  const updateField = (field: keyof PaymentData, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Header del resultado */}
      <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold text-green-800 dark:text-green-300">{editedData.banco}</p>
          <p className="text-sm text-green-700 dark:text-green-400">
            {TIPO_LABEL[editedData.tipo] ?? "Pago"}
            {editedData.moneda !== "desconocido" && editedData.monto
              ? ` • ${editedData.monto} ${editedData.moneda}`
              : ""}
          </p>
        </div>
      </div>

      {/* Campos extraídos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos extraídos</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Field label="Banco" value={editedData.banco} field="banco" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => updateField("banco", v)} />
          {editedData.referencia && <Field label="Referencia" value={editedData.referencia} field="referencia" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => updateField("referencia", v)} highlight />}
          {editedData.fecha && <Field label="Fecha" value={editedData.fecha} field="fecha" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => updateField("fecha", v)} />}
          {editedData.hora && <Field label="Hora" value={editedData.hora} field="hora" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => updateField("hora", v)} />}
          {editedData.monto && (
            <Field
              label="Monto"
              value={`${editedData.monto} ${editedData.moneda !== "desconocido" ? editedData.moneda : ""}`}
              field="monto"
              copiedField={copiedField}
              onCopy={copyToClipboard}
              onChange={(v) => updateField("monto", v)}
              highlight
            />
          )}
          {editedData.emisor?.nombre && <Field label="Emisor" value={editedData.emisor.nombre} field="emisor.nombre" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => setEditedData(p => ({ ...p, emisor: { ...p.emisor, nombre: v } }))} />}
          {editedData.emisor?.cedula && <Field label="Cédula" value={editedData.emisor.cedula} field="emisor.cedula" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => setEditedData(p => ({ ...p, emisor: { ...p.emisor, cedula: v } }))} />}
          {editedData.emisor?.telefono && <Field label="Teléfono" value={editedData.emisor.telefono} field="emisor.telefono" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => setEditedData(p => ({ ...p, emisor: { ...p.emisor, telefono: v } }))} />}
          {editedData.receptor?.nombre && <Field label="Receptor" value={editedData.receptor.nombre} field="receptor.nombre" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => setEditedData(p => ({ ...p, receptor: { ...p.receptor, nombre: v } }))} />}
          {editedData.concepto && <Field label="Concepto" value={editedData.concepto} field="concepto" copiedField={copiedField} onCopy={copyToClipboard} onChange={(v) => updateField("concepto", v)} />}
        </div>
      </div>

      {/* Botón copiar todo */}
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

      {/* Preview imagen + texto crudo */}
      {imageUrl && (
        <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer select-none">
            Ver imagen original
          </summary>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Comprobante original" className="w-full object-contain max-h-64 border-t border-gray-100 dark:border-gray-800" />
        </details>
      )}

      {data.rawText && (
        <details className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <summary
            className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer select-none"
            onClick={() => setShowRaw(!showRaw)}
          >
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
  copiedField: string | null;
  highlight?: boolean;
  onCopy: (text: string, field: string) => void;
  onChange: (value: string) => void;
}

function Field({ label, value, field, copiedField, highlight, onCopy, onChange }: FieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const copied = copiedField === field;

  const handleSave = () => {
    onChange(editValue);
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 flex items-center gap-3 ${highlight ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        {editing ? (
          <div className="flex gap-2">
            <input
              className="flex-1 text-sm border border-blue-300 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
            />
            <button onClick={handleSave} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">OK</button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-500 px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={`text-sm font-semibold text-left w-full truncate ${highlight ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-100"}`}
          >
            {value}
          </button>
        )}
      </div>
      <button
        onClick={() => onCopy(value, field)}
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
          copied
            ? "bg-green-100 dark:bg-green-900"
            : "bg-gray-100 dark:bg-gray-800 active:bg-blue-100 dark:active:bg-blue-900"
        }`}
        title={`Copiar ${label}`}
      >
        {copied ? "✅" : "📋"}
      </button>
    </div>
  );
}
