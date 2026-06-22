"use client";

import { useRef, useState } from "react";

interface Props {
  onImage: (file: File) => void;
}

export default function ImageUploader({ onImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    onImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 pb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Sube tu comprobante
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fotografía o selecciona la captura del pago
        </p>
      </div>

      {/* Botón principal: cámara (mobile) */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        <span className="text-2xl">📷</span>
        Tomar foto del comprobante
      </button>

      {/* Zona drag & drop / galería */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
          }`}
      >
        <p className="text-3xl mb-2">🖼️</p>
        <p className="font-medium text-gray-700 dark:text-gray-300">Seleccionar de la galería</p>
        <p className="text-sm text-gray-400 mt-1">o arrastra la imagen aquí</p>
      </div>

      {/* Inputs ocultos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Para mejores resultados:</p>
        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
          <li>Imagen nítida y bien iluminada</li>
          <li>Todo el texto del comprobante visible</li>
          <li>Sin reflejos ni sombras sobre el texto</li>
        </ul>
      </div>
    </div>
  );
}
