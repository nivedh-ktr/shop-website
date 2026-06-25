"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useAppContext } from "@/context/AppContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setIsLoggedIn } = useAppContext();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        setIsLoggedIn(true);
      }
      
      router.replace("/");
    };

    handleCallback();
  }, [router, setIsLoggedIn]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <p className="text-sm text-neutral-500">Authenticating...</p>
      </div>
    </main>
  );
}
