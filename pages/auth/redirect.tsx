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
        <title>Redirecting… | Article Idea Generator</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"
      >
        <div className="text-center p-8" role="status" aria-live="polite">
          <div className="relative w-16 h-16 mx-auto mb-6" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-700" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Redirecting…
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Taking you back to where you left off
          </p>
        </div>
      </main>
    </>
  );
}
