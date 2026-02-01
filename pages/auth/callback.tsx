import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;

    // Wait for router to be ready
    if (!router.isReady) {
      console.log("[Auth Callback] Router not ready yet");
      return;
    }

    hasRun.current = true;
    console.log("[Auth Callback] Starting authentication...");
    setStatus("Processing authentication...");

    const handleCallback = async () => {
      if (!isSupabaseConfigured) {
        console.error("[Auth Callback] Supabase is not configured");
        setError("Authentication is not configured");
        setTimeout(() => router.push("/?error=config_error"), 2000);
        return;
      }

      // Use the shared client (same instance that initiated sign-in)
      const supabase = createClient();

      // Check for error parameters from Supabase OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      if (errorParam) {
        console.error(
          "[Auth Callback] OAuth error:",
          errorParam,
          errorDescription,
        );
        setError(errorDescription?.replace(/\+/g, " ") || errorParam);
        setTimeout(() => router.push("/"), 2000);
        return;
      }

      // Get the code from URL
      const code = urlParams.get("code");
      console.log("[Auth Callback] Auth code present:", !!code);

      if (!code) {
        console.error("[Auth Callback] No auth code in URL");
        setError("No authentication code found");
        setTimeout(() => router.push("/?error=no_code"), 2000);
        return;
      }

      try {
        setStatus("Exchanging code for session...");
        console.log(
          "[Auth Callback] Calling exchangeCodeForSession with code:",
          code.substring(0, 8) + "...",
        );

        // Exchange the code for a session with timeout
        const startTime = Date.now();

        // Create a promise that rejects after 15 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                "Exchange timed out - but auth may have succeeded. Checking session...",
              ),
            );
          }, 15000);
        });

        let result;
        try {
          result = await Promise.race([
            supabase.auth.exchangeCodeForSession(code),
            timeoutPromise,
          ]);
        } catch (timeoutError) {
          console.log(
            "[Auth Callback] Timeout occurred, checking if session exists...",
          );

          // The network request completed but promise didn't resolve
          // Check if we have a session anyway
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log(
              "[Auth Callback] Session found after timeout! Redirecting...",
            );
            setStatus("Authentication successful! Redirecting...");
            const redirectTo =
              localStorage.getItem("auth_redirect") || "/tools";
            localStorage.removeItem("auth_redirect");
            router.replace(redirectTo);
            return;
          }

          throw timeoutError;
        }

        const elapsed = Date.now() - startTime;

        console.log("[Auth Callback] Exchange completed in", elapsed, "ms");
        console.log("[Auth Callback] Full result:", result);
        console.log("[Auth Callback] Exchange result:", {
          hasData: !!result.data,
          hasSession: !!result.data?.session,
          hasUser: !!result.data?.user,
          error: result.error?.message,
        });

        const { data, error: authError } = result;

        if (authError) {
          console.error("[Auth Callback] Auth error:", authError);
          setError(authError.message || "Authentication failed");
          setTimeout(() => router.push("/?error=auth_error"), 2000);
          return;
        }

        if (!data?.session) {
          console.error("[Auth Callback] No session returned");
          setError("Failed to create session");
          setTimeout(() => router.push("/?error=no_session"), 2000);
          return;
        }

        setStatus("Authentication successful! Redirecting...");
        console.log("[Auth Callback] Success! Redirecting...");

        // Small delay to ensure session is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect to the tools page or wherever they came from
        const redirectTo = localStorage.getItem("auth_redirect") || "/tools";
        localStorage.removeItem("auth_redirect");

        // Use replace to prevent back button issues
        router.replace(redirectTo);
      } catch (err) {
        console.error("[Auth Callback] Unexpected error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setTimeout(() => router.push("/?error=auth_error"), 2000);
      }
    };

    handleCallback();
  }, [router, router.isReady]);

  return (
    <>
      <Head>
        <title>Signing in... | Article Idea Generator</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8">
          {error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-500/20">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Authentication Failed
              </h1>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <p className="text-slate-400 text-xs">Redirecting you back...</p>
            </>
          ) : (
            <>
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Signing you in...
              </h1>
              <p className="text-slate-400 text-sm">{status}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
