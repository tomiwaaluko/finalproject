import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const useOwner = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        if (session?.user) {
          if (!mounted) return;
          setUserId(session.user.id);
          setIsLoading(false);
          return;
        }

        const { data, error: signInError } =
          await supabase.auth.signInAnonymously();
        if (!mounted) return;
        if (signInError) {
          console.error("Anonymous sign-in error:", signInError);
          setError(signInError.message);
        } else if (data.user) {
          setUserId(data.user.id);
        }
      } catch (e: any) {
        if (!mounted) return;
        console.error("Auth error:", e);
        setError(e?.message ?? "Authentication failed");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    // Re-run the effect by calling auth getSession; the effect covers updating
    supabase.auth.getSession().finally(() => setIsLoading(false));
  };

  return { userId, isLoading, error, retry };
};
