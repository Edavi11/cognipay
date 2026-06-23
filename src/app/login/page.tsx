import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-blue-600/30">
            💳
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CogniPay</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa con tu cuenta para continuar
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
