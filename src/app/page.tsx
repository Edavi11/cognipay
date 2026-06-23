export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PaymentScanner from "@/components/PaymentScanner";
import AppHeader from "@/components/AppHeader";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader userEmail={user.email ?? ""} />
      <div className="max-w-lg mx-auto px-4 py-6">
        <PaymentScanner />
      </div>
    </main>
  );
}
