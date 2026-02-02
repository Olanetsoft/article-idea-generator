import { useEffect, useState } from "react";
import Head from "next/head";

export default function AuthRedirectPage() {
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;

    // Redirect immediately - don't wait for auth state
    // The target page will detect the session from cookies
    const timer = setTimeout(() => {
      const redirectTo = localStorage.getItem("auth_redirect") || "/tools";
      localStorage.removeItem("auth_redirect");

      setHasRedirected(true);

      // Force a full page reload to ensure auth state is fresh
      window.location.href = redirectTo;
    }, 100);

    return () => clearTimeout(timer);
  }, [hasRedirected]);

  return (
    <>
      <Head>
        <title>Redirecting... | Article Idea Generator</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Signed in successfully!
          </h1>
          <p className="text-slate-400 text-sm">Redirecting you back...</p>
        </div>
      </div>
    </>
  );
}
