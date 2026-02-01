import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Only run on client side when Supabase is configured
      if (!isSupabaseConfigured) {
        console.error("Supabase is not configured");
        router.push("/?error=config_error");
        return;
      }

      try {
        const supabase = createClient();
        // Get the code from the URL
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/?error=auth_error");
          return;
        }

        // Redirect to the tools page or wherever they came from
        const redirectTo = localStorage.getItem("auth_redirect") || "/tools";
        localStorage.removeItem("auth_redirect");
        router.push(redirectTo);
      } catch (err) {
        console.error("Auth callback error:", err);
        router.push("/?error=auth_error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <>
      <Head>
        <title>Signing in... | Article Idea Generator</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Signing you in...
          </h1>
          <p className="text-slate-400 text-sm">
            Please wait while we complete the authentication
          </p>
        </div>
      </div>
    </>
  );
}
