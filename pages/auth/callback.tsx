import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing…");
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;

    // Wait for router to be ready
    if (!router.isReady) return;

    hasRun.current = true;
    setStatus("Processing authentication…");

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

      if (!code) {
        console.error("[Auth Callback] No auth code in URL");
        setError("No authentication code found");
        setTimeout(() => router.push("/?error=no_code"), 2000);
        return;
      }

      try {
        setStatus("Exchanging code for session…");

        // Create a promise that rejects after 15 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                "Exchange timed out - but auth may have succeeded. Checking session…",
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
          // The network request completed but promise didn't resolve
          // Check if we have a session anyway
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            setStatus("Authentication successful! Redirecting…");
            const redirectTo =
              localStorage.getItem("auth_redirect") || "/tools";
            localStorage.removeItem("auth_redirect");
            router.replace(redirectTo);
            return;
          }

          throw timeoutError;
        }

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

        setStatus("Authentication successful! Redirecting…");

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
        <title>Signing in… | Article Idea Generator</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"
      >
        <div className="text-center p-8" role="status" aria-live="polite">
          {error ? (
            <>
              <div
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20"
                aria-hidden="true"
              >
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h1>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                {error}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Redirecting you back…
              </p>
            </>
          ) : (
            <>
              <div
                className="relative w-16 h-16 mx-auto mb-6"
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-700" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Signing you in…
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {status}
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
