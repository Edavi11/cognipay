"use client";

import { useState } from "react";
import { PaymentData } from "@/types/payment";

interface Props {
  data: PaymentData;
  imageFile: File | null;
  onClose: () => void;
}

const FIELD_LABELS: { key: keyof PaymentData; label: string }[] = [
  { key: "bancoOrigen", label: "Banco Origen" },
  { key: "bancoDestino", label: "Banco Destino" },
  { key: "referencia", label: "Referencia" },
  { key: "monto", label: "Monto" },
  { key: "fecha", label: "Fecha" },
  { key: "concepto", label: "Concepto" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function FeedbackModal({ data, imageFile, onClose }: Props) {
  const [incorrectFields, setIncorrectFields] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const toggle = (key: string) => {
    setIncorrectFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    setStatus("loading");

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("raw_text", data.rawText ?? "");
    formData.append("extracted_data", JSON.stringify(data));
    formData.append("incorrect_fields", JSON.stringify(incorrectFields));
    formData.append("comment", comment);

    const res = await fetch("/api/feedback", { method: "POST", body: formData });

    setStatus(res.ok ? "success" : "error");
  };

  if (status === "success") {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center space-y-3 py-6">
          <p className="text-5xl">✅</p>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">¡Gracias por el reporte!</p>
          <p className="text-sm text-gray-500">Tu feedback ayuda a mejorar la extracción automática.</p>
          <button onClick={onClose} className="mt-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold">
            Cerrar
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Reportar error de extracción</h2>
          <p className="text-sm text-gray-500 mt-1">Marca los campos que NO fueron extraídos correctamente.</p>
        </div>

        {/* Checkboxes de campos */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
          {FIELD_LABELS.map(({ key, label }) => {
            const value = String(data[key] ?? "");
            const checked = incorrectFields.includes(key);
            return (
              <label
                key={key}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-red-50 dark:bg-red-950/30" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="mt-0.5 w-5 h-5 rounded accent-red-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-sm font-medium truncate ${checked ? "text-red-600 dark:text-red-400 line-through" : "text-gray-800 dark:text-gray-200"}`}>
                    {value || "—"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Comentario opcional */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej: El monto correcto era Bs. 150.000,00"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500 text-center">Error al enviar. Intenta de nuevo.</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm active:scale-95 transition-transform"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === "loading" || incorrectFields.length === 0}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Enviando..." : "Enviar reporte"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
