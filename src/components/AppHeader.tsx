"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  userEmail: string;
}

export default function AppHeader({ userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-blue-600 text-white px-4 py-4 shadow-md safe-top">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg shrink-0">
          💳
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-none">CogniPay</h1>
          <p className="text-blue-100 text-xs mt-0.5 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-colors active:scale-95"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
