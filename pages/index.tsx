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

    const prompt = `Generate 4 article title for "${text}". ${
      seoEnabled ? "Ensure its SEO friendly titles with clickbait. " : ""
    }Make sure its not more than 4, its relevant and not out of context.`;

    try {
      const response = await fetch("/api/generate", {
        ...fetchOptions,
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedTitles(data.choices[0].message.content);
    } catch {
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

    const prompt = `Generate a concise, high-quality abstract for "${title}" that briefly covers the topic, key points, relevance, impact, and structure with appropriate technical depth. Ensure the abstract does not include any phrases like 'This abstract provides' or 'This paper discusses' or similar. Focus on content only.`;

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        ...fetchOptions,
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
    if (text) {
      generateArticleTitle();
    }
  }, [seoEnabled]);

  return (
    <div className="flex flex-col items-center m-0">
      <Head>
        <title>Article Idea Generator</title>
        <meta
          name="description"
          content="Using Article Idea Generator can help you get over writer's block. Do you have an idea of where to start? Generate your next article idea with ease."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="flex flex-col items-center pt-14 w-full px-4 lg:px-0 max-w-screen-md">
        <h1
          className={`${spaceGrotesk.className} text-3xl font-bold text-gray-900 dark:text-zinc-300 sm:leading-9 sm:truncate mb-2 text-center sm:text-4xl lg:text-6xl xl:text-6xl`}
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
            className="flex-grow focus:outline-none dark:text-white bg-transparent text-gray-700"
            placeholder="What's on your mind?"
            id="search-box"
          />
          <button
            className="border dark:border-zinc-600 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 transition"
            id="submit"
            aria-label="search-button"
          >
            <ArrowSmRightIcon className="w-6 h-6 text-white" />
          </button>
        </form>

        <div className="flex w-full max-w-screen-md items-center justify-between mt-8 mb-2 ml-6">
          <label
            htmlFor="bordered-checkbox-1"
            className="flex items-center justify-center cursor-pointer"
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
            />
            <div className="bg-transparent border-2 rounded-md border-indigo-400 w-4 h-4 flex justify-center items-center mr-2 cursor-pointer">
              {seoEnabled && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="4"
                  stroke="#4f46e5"
                  className="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
            </div>
            <span className="select-none cursor-pointer">
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
              {generatedTitles && (
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
                      >
                        <p className="text-zinc-800 dark:text-zinc-300 font-bold flex-grow">
                          {title.replace(/"/g, "")}
                        </p>
                        <div className="relative group flex items-center">
                          <DocumentSearchIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              generateAbstractForArticles(
                                title.replace(/"/g, "")
                              );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                generateAbstractForArticles(
                                  title.replace(/"/g, "")
                                );
                              }
                            }}
                            className="h-5 text-[#6366f1] dark:text-gray-100 cursor-pointer"
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                            Generate abstract
                          </div>
                        </div>
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
                  >
                    <div className="flex items-center">
                      <p className="text-zinc-800 dark:text-zinc-300 text-sm">
                        {abstract.replace(/"/g, "")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </div>
      <Footer />
    </div>
  );
}
