import { useAuth } from "@/contexts";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { Header, Footer } from "@/components";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

interface NavItem {
  href: string;
  label: string;
  exactMatch?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", exactMatch: true },
  { href: "/dashboard/links", label: "My Links" },
  { href: "/dashboard/analytics", label: "Analytics" },
];

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const isActiveRoute = (item: NavItem) => {
    if (item.exactMatch) {
      return router.pathname === item.href;
    }
    return router.pathname.startsWith(item.href);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
              <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading your dashboard...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not signed in state
  if (!user) {
    return (
      <>
        <Head>
          <title>Sign In Required | Article Idea Generator</title>
        </Head>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-violet-600 dark:text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sign in to continue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Access your dashboard to manage links and view analytics.
              </p>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center justify-center gap-2.5 w-full px-5 py-2.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-all duration-200 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-5">
                <Link
                  href="/"
                  className="text-violet-600 dark:text-violet-400 hover:underline"
                >
                  ← Back to Home
                </Link>
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Authenticated dashboard view
  return (
    <>
      <Head>
        <title>{`${title} | Dashboard`}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
        <Header />

        {/* Dashboard Sub-navigation - Clean tab-style design */}
        <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between">
              {/* Tab Navigation */}
              <nav className="flex items-center -mb-px overflow-x-auto scrollbar-hide">
                {navItems.map((item) => {
                  const isActive = isActiveRoute(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      {item.label}
                      {/* Active indicator line */}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* CTA Button */}
              <Link
                href="/tools/url-shortener"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Link
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile CTA - Fixed bottom on small screens */}
        <Link
          href="/tools/url-shortener"
          className="sm:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-violet-600 text-white font-medium rounded-full hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Link
        </Link>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
