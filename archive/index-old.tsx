import Head from "next/head";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Space_Grotesk } from "@next/font/google";
import { SearchIcon } from "@heroicons/react/outline";
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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [additionalFeature, setAdditionalFeature] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState("");
  const [text, setText] = useState("");

  const prompt =
    additionalFeature === true
      ? `Generate 4 article title for ${text}. Ensure its SEO friendly titles with clickbait. Make sure its not more than 4, its relevant and not out out of context.`
      : `Generate 4 article title for "${text}". Make sure its not more than 4, its relevant and not out out of context.`;

  const generateArticleTitle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text) {
      toast.error("Input what's on your mind!");
      return;
    }

    setGeneratedTitles("");
    setLoading(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setGeneratedTitles((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    <>
      <div className={`flex flex-col items-center m-0 `}>
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

        {/*body*/}
        <div className="flex flex-col items-center pt-14 w-full px-4 md:px-0 max-w-screen-md">
          <h1
            className={`${spaceGrotesk.className} text-3xl font-bold text-gray-900 dark:text-zinc-300  sm:leading-9 sm:truncate mb-2 text-center sm:text-4xl lg:text-6xl xl:text-6xl`}
          >
            Article Idea Generator
          </h1>
          <form
            onSubmit={(e) => generateArticleTitle(e)}
            className="flex w-full mt-5 transition-all ease-linear hover:shadow-lg focus-within:shadow-lg  rounded-full border border-[#6366f1] dark:border-[#6366f1] p-1.5 pl-5 items-center"
          >
            <SearchIcon className="h-5 mr-3 text-[#6366f1] dark:text-gray-100" />
            <label htmlFor="search" className="sr-only"></label>
            <input
              onChange={(e) => setText(e.target.value)}
              type="text"
              className="flex-grow focus:outline-none dark:text-white bg-transparent text-gray-700"
              placeholder="What's on your mind?"
              id="search-box"
            />
            <button
              className="border dark:border-zinc-600 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500"
              id="submit"
              aria-label="search-button"
            >
              <ArrowSmRightIcon className="w-6 h-6 text-white" />
            </button>
          </form>

          <div className="flex w-full max-w-screen-md items-center justify-between mt-8 mb-2 ml-6">
            <label
              htmlFor="bordered-checkbox-1"
              className="flex items-center justify-center"
            >
              <input
                type="checkbox"
                id="bordered-checkbox-1"
                name="bordered-checkbox"
                value="yes"
                checked={additionalFeature}
                onChange={() => setAdditionalFeature((prev) => !prev)}
                onClick={(e) => generateArticleTitle(e)}
                className="opacity-0 absolute h-8 w-8"
              />
              <div className="bg-transparent border-2 rounded-md border-indigo-400 w-4 h-4 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-indigo-500">
                <svg
                  className="fill-current hidden w-3 h-3 text-indigo-600 pointer-events-none"
                  version="1.1"
                  viewBox="0 0 17 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none" fillRule="evenodd">
                    <g
                      transform="translate(-9 -11)"
                      fill="#6366f1"
                      fillRule="nonzero"
                    >
                      <path d="m25.576 11.414c0.56558 0.55188 0.56558 1.4439 0 1.9961l-9.404 9.176c-0.28213 0.27529-0.65247 0.41385-1.0228 0.41385-0.37034 0-0.74068-0.13855-1.0228-0.41385l-4.7019-4.588c-0.56584-0.55188-0.56584-1.4442 0-1.9961 0.56558-0.55214 1.4798-0.55214 2.0456 0l3.679 3.5899 8.3812-8.1779c0.56558-0.55214 1.4798-0.55214 2.0456 0z" />
                    </g>
                  </g>
                </svg>
              </div>
              <span className="select-none">
                Enable SEO & Clickbait Feature
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
                    <p className="text-xs text-center font-bold text-gray-400 uppercase">
                      Click on any idea to copy it to your clipboard
                    </p>
                    <div className="max-w-screen-md grid gap-2 grid-cols-1  m-auto md:grid-cols-2">
                      {generatedTitles
                        .match(/[0-9]+.[^0-9]+/g)
                        ?.sort((a, b) => b.length - a.length)
                        ?.map((generatedTitle, index) => {
                          const textContent = generatedTitle
                            .replace(/^"|"$|[0-9]+. /g, "")
                            .trim();

                          return (
                            <div
                              className="bg-zinc-100 dark:bg-darkOffset  dark:text-gray-100 rounded-md p-3 hover:bg-gray-100 transition cursor-copy border-zinc-200 border dark:border-zinc-800"
                              onClick={() => {
                                navigator.clipboard.writeText(textContent);
                                toast.success("Title copied to clipboard");
                              }}
                              key={index}
                            >
                              <p className="text-zinc-800 dark:text-zinc-300">
                                {textContent}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </ResizablePanel>
        </div>
        <Footer />
      </div>
    </>
  );
}
