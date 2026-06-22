"use client";

import { useState, useRef, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { parsePayment } from "@/lib/parsePayment";
import { PaymentData } from "@/types/payment";
import ImageUploader from "./ImageUploader";
import PaymentResult from "./PaymentResult";

type ScanState = "idle" | "processing" | "done" | "error";

export default function PaymentScanner() {
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<PaymentData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImage = useCallback(async (file: File) => {
    setImageUrl(URL.createObjectURL(file));
    setState("processing");
    setProgress(0);
    setErrorMsg("");

    try {
      const worker = await createWorker("spa+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setProgressMsg("Leyendo texto...");
          } else {
            setProgressMsg(m.status);
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parsePayment(data.text);
      setResult(parsed);
      setState("done");
    } catch {
      setErrorMsg("No se pudo procesar la imagen. Intenta con una foto más nítida.");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setImageUrl(null);
    setProgress(0);
    setProgressMsg("");
    setErrorMsg("");
  };

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <ImageUploader onImage={handleImage} />
      )}

      {state === "processing" && (
        <ProcessingView progress={progress} message={progressMsg} imageUrl={imageUrl} />
      )}

      {state === "done" && result && (
        <>
          <PaymentResult data={result} imageUrl={imageUrl} />
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold text-base active:scale-95 transition-transform"
          >
            📷 Escanear otro comprobante
          </button>
        </>
      )}

      {state === "error" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-4xl mb-2">⚠️</p>
            <p className="text-red-700 font-medium">{errorMsg}</p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-base active:scale-95 transition-transform"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

function ProcessingView({ progress, message, imageUrl }: { progress: number; message: string; imageUrl: string | null }) {
  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Comprobante" className="w-full object-contain max-h-56 opacity-60" />
        </div>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center space-y-4">
        <div className="text-3xl animate-pulse">🔍</div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">Procesando comprobante...</p>
        <p className="text-sm text-gray-500 capitalize">{message || "Iniciando OCR..."}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-medium text-blue-600">{progress}%</p>
      </div>
    </div>
  );
}
