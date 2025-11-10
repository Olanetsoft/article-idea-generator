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

export default function FAQ(): JSX.Element {
  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>FAQ - Article Idea Generator | Frequently Asked Questions</title>
        <meta
          name="description"
          content="Get answers to common questions about our free AI-powered article title generator. Learn how to generate SEO-optimized titles, create abstracts, and maximize your content creation."
        />
        <meta
          name="keywords"
          content="article generator FAQ, how to use article generator, AI title generator help, content creation questions, SEO title tips, article writing help"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://articleideagenerator.com/faq" />

        {/* Open Graph */}
        <meta property="og:title" content="FAQ - Article Idea Generator" />
        <meta
          property="og:description"
          content="Get answers to common questions about our free AI-powered article title generator."
        />
        <meta
          property="og:url"
          content="https://articleideagenerator.com/faq"
        />
        <meta property="og:type" content="website" />

        {/* Structured Data for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is an article idea generator?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "An article idea generator is an AI-powered tool that creates compelling article titles and headlines based on your topic or keywords. It helps writers, bloggers, and content creators overcome writer's block and find engaging angles for their content.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the article title generator really free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Our article idea generator is completely free to use with no signup required. You can generate unlimited article titles without any restrictions or hidden fees.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What's the difference between SEO mode and regular mode?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "SEO mode generates titles optimized for search engines with attention-grabbing elements and relevant keywords. Regular mode creates professional, straightforward titles without clickbait elements. Choose based on your content goals.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I generate abstracts for my article titles?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Click the document icon next to any generated title to create a professional abstract. This helps you plan your article structure and key points before writing.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What AI model powers the article generator?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We use GPT-4o-mini, OpenAI's latest and most efficient model, to generate high-quality, creative article titles and abstracts in seconds.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many article titles can I generate?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can generate unlimited article titles! There are no daily limits, no signup requirements, and no hidden restrictions. Use it as much as you need.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I use the generated titles for commercial purposes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! All generated titles are yours to use freely for any purpose - personal blogs, commercial websites, client work, or any other content creation needs.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Why should I use an article title generator?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "An article title generator helps you overcome writer's block, saves time brainstorming, provides SEO-optimized titles, offers fresh perspectives on topics, and helps you create more engaging content that attracts readers.",
                  },
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://articleideagenerator.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "FAQ",
                  item: "https://articleideagenerator.com/faq",
                },
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <div className="flex flex-col items-center pt-8 sm:pt-14 w-full px-4 lg:px-0 max-w-screen-md flex-grow pb-8">
        {/* Breadcrumb */}
        <nav className="w-full mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-500 dark:hover:text-indigo-400 transition"
              >
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-gray-200 font-semibold">
              FAQ
            </li>
          </ol>
        </nav>

        <h1
          className={`${spaceGrotesk.className} text-2xl font-bold text-gray-900 dark:text-zinc-300 leading-tight mb-4 text-center sm:text-4xl lg:text-5xl`}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
          Everything you need to know about using our AI-powered article idea
          generator
        </p>

        <div className="w-full space-y-4 mb-8">
          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              What is an article idea generator?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              An article idea generator is an AI-powered tool that creates
              compelling article titles and headlines based on your topic or
              keywords. It helps writers, bloggers, and content creators
              overcome writer&apos;s block and find engaging angles for their
              content.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              Is the article title generator really free?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              Yes! Our article idea generator is completely free to use with no
              signup required. You can generate unlimited article titles without
              any restrictions or hidden fees.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              What&apos;s the difference between SEO mode and regular mode?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              SEO mode generates titles optimized for search engines with
              attention-grabbing elements and relevant keywords. Regular mode
              creates professional, straightforward titles without clickbait
              elements. Choose based on your content goals.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              Can I generate abstracts for my article titles?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              Yes! Click the document icon next to any generated title to create
              a professional abstract. This helps you plan your article
              structure and key points before writing.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              What AI model powers the article generator?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              We use GPT-4o-mini, OpenAI&apos;s latest and most efficient model,
              to generate high-quality, creative article titles and abstracts in
              seconds.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              How many article titles can I generate?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              You can generate unlimited article titles! There are no daily
              limits, no signup requirements, and no hidden restrictions. Use it
              as much as you need.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              Can I use the generated titles for commercial purposes?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              Yes! All generated titles are yours to use freely for any purpose
              - personal blogs, commercial websites, client work, or any other
              content creation needs.
            </p>
          </details>

          <details className="bg-white dark:bg-zinc-800 p-5 rounded-lg border border-gray-200 dark:border-zinc-700 group">
            <summary className="font-semibold text-gray-900 dark:text-zinc-200 cursor-pointer text-lg">
              Why should I use an article title generator?
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              An article title generator helps you overcome writer&apos;s block,
              saves time brainstorming, provides SEO-optimized titles, offers
              fresh perspectives on topics, and helps you create more engaging
              content that attracts readers.
            </p>
          </details>
        </div>

        <div className="w-full bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-200 mb-2">
            Ready to Generate Article Ideas?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start creating compelling article titles in seconds
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
          >
            Try It Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
