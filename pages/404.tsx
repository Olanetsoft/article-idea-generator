import Head from "next/head";
import Link from "next/link";
import { Space_Grotesk } from "@next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

export default function Custom404(): JSX.Element {
  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>404 - Page Not Found | Article Idea Generator</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist. Return to Article Idea Generator to create SEO-optimized article titles with AI."
        />
        <meta name="robots" content="noindex, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="404 - Page Not Found | Article Idea Generator"
        />
        <meta
          property="og:description"
          content="The page you're looking for doesn't exist. Return to Article Idea Generator."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://articleideagenerator.com/404"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="404 - Page Not Found | Article Idea Generator"
        />
        <meta
          name="twitter:description"
          content="The page you're looking for doesn't exist."
        />
      </Head>

      <Header />

      <div className="flex flex-col items-center justify-center flex-grow w-full px-4 text-center">
        <h1
          className={`${spaceGrotesk.className} text-6xl sm:text-8xl font-bold text-indigo-500 mb-4`}
        >
          404
        </h1>
        <h2
          className={`${spaceGrotesk.className} text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-300 mb-4`}
        >
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Generate Article Ideas
          </Link>
          <Link
            href="/faq"
            className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-300 font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            View FAQ
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
