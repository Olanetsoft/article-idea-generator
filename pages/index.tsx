import Head from "next/head";
import React, { useState, FormEvent, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Space_Grotesk } from "@next/font/google";
import { SearchIcon, DocumentSearchIcon } from "@heroicons/react/outline";
import { ArrowSmRightIcon } from "@heroicons/react/solid";
import { AnimatePresence, motion } from "framer-motion";

import ResizablePanel from "../components/ResizablePanel";
import Header from "../components/Header";
import Footer from "../components/Footer";

const spaceGrotesk = Space_Grotesk({
  weight: "700",
  display: "swap",
  subsets: ["latin"],
});

const fetchOptions = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

export default function Home(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [seoEnabled, setSeoEnabled] = useState<boolean>(false);
  const [generatedTitles, setGeneratedTitles] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [abstract, setAbstract] = useState<string>("");

  const generateArticleTitle = async (): Promise<void> => {
    if (!text.trim()) {
      toast.error("Please enter a topic!");
      return;
    }
    setGeneratedTitles("");
    setAbstract("");
    setLoading(true);

    const systemMessage = `You are an expert content strategist and SEO specialist. Generate compelling, clear, and engaging article titles that capture reader attention while accurately representing the topic.`;

    const prompt = seoEnabled
      ? `Generate exactly 4 SEO-optimized article titles for the topic: "${text}". 
         
Requirements:
- Each title should be attention-grabbing and click-worthy
- Include relevant keywords naturally
- Keep titles between 50-60 characters for optimal SEO
- Use power words and emotional triggers
- Make them specific and actionable
- Number each title (1., 2., 3., 4.)

Format: Return only the 4 numbered titles, one per line.`
      : `Generate exactly 4 professional article titles for the topic: "${text}".

Requirements:
- Clear and informative titles
- Accurately represent the content
- Engaging but not clickbait
- Professional tone
- Number each title (1., 2., 3., 4.)

Format: Return only the 4 numbered titles, one per line.`;

    try {
      const response = await fetch("/api/generate", {
        ...fetchOptions,
        body: JSON.stringify({ prompt, systemMessage }),
      });
      const data = await response.json();

      if (!response.ok || !data.choices || !data.choices[0]) {
        throw new Error(
          data.error?.message || "Failed to generate article titles"
        );
      }

      setGeneratedTitles(data.choices[0].message.content);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const generateAbstractForArticles = async (title: string): Promise<void> => {
    if (!title) {
      toast.error("Generate an article title first!");
      return;
    }

    const systemMessage = `You are a seasoned writer with 15 years of experience. Write naturally and conversationally, avoiding corporate jargon and AI-sounding language. Be direct and human.`;

    const prompt = `Write a compelling abstract for: "${title}"

STRICT RULES - DO NOT USE these overused AI phrases:
❌ "delve into", "landscape", "realm", "navigating", "pivotal", "robust", "comprehensive", "harness", "leverage", "unlock", "embark", "journey", "dive deep", "it's important to note", "revolutionize", "game-changer", "cutting-edge", "seamless", "empower", "transform", "unveil", "uncover", "探索" (explore)

❌ NO meta phrases like: "This article explores", "We will discuss", "This piece examines", "In this post"

INSTEAD, write like a human:
✅ Use simple, direct language
✅ Start with the actual topic, not what the article does
✅ Write 120-180 words
✅ Use active voice and concrete examples
✅ Be conversational but professional
✅ Focus on what readers will learn or gain
✅ Use contractions (it's, you'll, we're) when natural
✅ Vary sentence length

Format: Just the abstract text, nothing else.`;

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        ...fetchOptions,
        body: JSON.stringify({ prompt, systemMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error(data.error?.message || "Failed to generate abstract");
      }

      setAbstract(data.choices[0].message.content);
      toast.success("Abstract generated successfully!");
    } catch (error) {
      toast.error("Failed to generate abstract. Please try again!");
      console.error("Error generating abstract:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (text && seoEnabled !== undefined) {
      generateArticleTitle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seoEnabled]);

  return (
    <div className="flex flex-col items-center m-0 min-h-screen">
      <Head>
        <title>
          Article Idea Generator - Free AI Title Generator for Writers &
          Bloggers
        </title>
        <meta
          name="description"
          content="Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block and generate creative article ideas in seconds. Perfect for bloggers, content creators, and writers."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Article Idea Generator",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block and generate creative article ideas in seconds.",
              url: "https://articleideagenerator.com",
              author: {
                "@type": "Organization",
                name: "Article Idea Generator",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
              },
              featureList: [
                "AI-powered title generation",
                "SEO-optimized titles",
                "Clickbait mode",
                "Abstract generation",
                "Instant results",
                "Free to use",
              ],
            }),
          }}
        />
      </Head>

      <Header />

      <div className="flex flex-col items-center pt-8 sm:pt-14 w-full px-4 lg:px-0 max-w-screen-md flex-grow pb-8">
        <h1
          className={`${spaceGrotesk.className} text-2xl font-bold text-gray-900 dark:text-zinc-300 leading-tight mb-4 text-center sm:text-4xl lg:text-5xl xl:text-6xl`}
        >
          Article Idea Generator
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateArticleTitle();
          }}
          className="flex w-full mt-5 transition-all ease-linear hover:shadow-lg focus-within:shadow-lg rounded-full border border-[#6366f1] dark:border-[#6366f1] p-1.5 pl-5 items-center bg-white dark:bg-zinc-800"
        >
          <SearchIcon className="h-5 mr-3 text-[#6366f1] dark:text-gray-100" />
          <input
            onChange={(e) => setText(e.target.value)}
            type="text"
            className="flex-grow focus:outline-none dark:text-white bg-transparent text-gray-700 py-2"
            placeholder="What's on your mind?"
            id="search-box"
            aria-label="Enter article topic"
          />
          <button
            className="border dark:border-zinc-600 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            id="submit"
            aria-label="Generate article titles"
            disabled={loading}
          >
            <ArrowSmRightIcon className="w-6 h-6 text-white" />
          </button>
        </form>

        <div className="flex w-full max-w-screen-md items-center justify-between mt-8 mb-2 px-2 sm:ml-6">
          <label
            htmlFor="bordered-checkbox-1"
            className="flex items-center cursor-pointer text-xs sm:text-sm md:text-base"
          >
            <input
              type="checkbox"
              id="bordered-checkbox-1"
              name="bordered-checkbox"
              checked={seoEnabled}
              onChange={() => {
                setSeoEnabled((prev) => !prev);
              }}
              className="opacity-0 absolute h-8 w-8 cursor-pointer"
              disabled={loading}
            />
            <div className="bg-transparent border-2 rounded-md border-indigo-400 w-5 h-5 flex justify-center items-center mr-2 cursor-pointer flex-shrink-0">
              {seoEnabled && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
                  stroke="#4f46e5"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
            </div>
            <span className="select-none cursor-pointer break-words">
              Enable SEO &amp; Clickbait Feature
            </span>
          </label>
          {loading && (
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 animate-spin text-black-600 dark:text-gray-100"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </div>
          )}
        </div>

        <Toaster
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{ duration: 3000 }}
        />
        <div className="h-px max-w-screen-md w-full border-b dark:border-zinc-800"></div>

        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-4 my-5">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-full bg-zinc-100 dark:bg-darkOffset rounded-md p-3 border-zinc-200 border dark:border-zinc-800 animate-pulse"
                    >
                      <div className="h-6 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </motion.div>
              )}
              {generatedTitles && !loading && (
                <>
                  <p className="text-xs text-center font-bold text-gray-400">
                    Click on any idea to copy it to your clipboard or the icon
                    to generate abstract.
                  </p>
                  {generatedTitles.split("\n").map((title, index) => (
                    <div className="flex items-center gap-3" key={index}>
                      <div
                        className="w-full bg-zinc-100 dark:bg-darkOffset dark:text-gray-100 rounded-md p-3 hover:bg-gray-100 transition cursor-copy border-zinc-200 border dark:border-zinc-800 flex justify-between items-center"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            title.replace(/[^a-zA-Z\s]/g, "")
                          );
                          toast.success("Title copied to clipboard");
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigator.clipboard.writeText(
                              title.replace(/[^a-zA-Z\s]/g, "")
                            );
                            toast.success("Title copied to clipboard");
                          }
                        }}
                        aria-label={`Copy title: ${title.replace(/"/g, "")}`}
                      >
                        <p className="text-zinc-800 dark:text-zinc-300 font-bold flex-grow break-words">
                          {title.replace(/"/g, "")}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateAbstractForArticles(
                              title.replace(/"/g, "")
                            );
                          }}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition"
                          aria-label="Generate abstract for this title"
                          disabled={loading}
                        >
                          <DocumentSearchIcon className="h-6 w-6 text-[#6366f1] dark:text-gray-100" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {abstract && (
                <>
                  <p className="text-xs text-center font-bold text-gray-400">
                    Click to copy abstract
                  </p>

                  <div
                    className="bg-zinc-100 dark:bg-darkOffset dark:text-gray-100 rounded-md p-3 hover:bg-gray-100 transition cursor-copy border-zinc-200 border dark:border-zinc-800"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        abstract.replace(/[^a-zA-Z\s]/g, "")
                      );
                      toast.success("Abstract copied to clipboard");
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigator.clipboard.writeText(
                          abstract.replace(/[^a-zA-Z\s]/g, "")
                        );
                        toast.success("Abstract copied to clipboard");
                      }
                    }}
                    aria-label="Copy abstract to clipboard"
                  >
                    <div className="flex items-center">
                      <p className="text-zinc-800 dark:text-zinc-300 text-sm break-words">
                        {abstract.replace(/"/g, "")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>

        {/* SEO Content Sections - Only show when no results and not loading */}
        {!generatedTitles && !loading && (
          <section className="w-full max-w-screen-md mt-12 sm:mt-16 px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-zinc-200 mb-6 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                    1
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-2 text-base sm:text-lg">
                  Enter Your Topic
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type any subject or keyword you want to write about
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                    2
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-2 text-base sm:text-lg">
                  AI Generates Titles
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get 4 unique, SEO-optimized article titles instantly
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 dark:text-indigo-300 font-bold text-xl">
                    3
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-2 text-base sm:text-lg">
                  Copy & Create
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to copy and start writing your article
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
