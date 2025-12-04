import { ReactNode, useMemo, useEffect } from "react";
import { AppState } from "react-native";

import { createClient, processLock } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SupabaseContext } from "@/context/supabase-context";

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const supabaseUrl = "https://qzxqglmhmqhxkzyuotyy.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eHFnbG1obXFoeGt6eXVvdHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzEwODUsImV4cCI6MjA3ODkwNzA4NX0.tvFy8lhXWIwSPJ2htGxFEbtKhFlZ4VopuT5ambI_T3Y";

  const supabase = useMemo(
    () =>
      createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock,
        },
      }),
    [supabaseUrl, supabaseKey]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => {
      subscription?.remove();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};
