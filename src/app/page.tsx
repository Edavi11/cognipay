import PaymentScanner from "@/components/PaymentScanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-blue-600 text-white px-4 py-4 shadow-md safe-top">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
            💳
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">CogniPay</h1>
            <p className="text-blue-100 text-xs mt-0.5">Lector de comprobantes</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <PaymentScanner />
      </div>
    </main>
  );
}
