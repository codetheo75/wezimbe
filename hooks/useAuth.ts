"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profileError) {
            setError(profileError.message);
            return;
          }

          setUser(userProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser(userProfile);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  };

  return { user, loading, error, signOut };
}
