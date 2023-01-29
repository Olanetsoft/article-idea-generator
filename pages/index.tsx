import Head from "next/head";
import { SearchIcon, DotsCircleHorizontalIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import ResizablePanel from "../components/ResizablePanel";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [additionalFeature, setAdditionalFeature] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState("");
  const [text, setText] = useState("");

  const prompt =
    additionalFeature === true
      ? `Generate 4 article title for ${text}. Ensure its SEO friendly titles with clickbait.`
      : `Generate 4 article title for ${text}.`;

  const generateArticleTitle = async (e: any) => {
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

    console.log("responding...");

    if (!response.ok) {
      setLoading(false);
      console.error(response.statusText);
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
        <form
          onSubmit={(e) => generateArticleTitle(e)}
          className="flex flex-col items-center pt-3 w-4/5"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-9 sm:truncate mb-2 text-center sm:text-4xl lg:text-5xl xl:text-6xl ">
            Article Idea Generator
          </h1>
          <div
            className="flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full
      border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl"
          >
            <SearchIcon className="h-5 mr-3 text-gray-700 dark:text-gray-100" />
            <label htmlFor="search" className="sr-only"></label>
            <input
              onChange={(e) => setText(e.target.value)}
              type="text"
              className="flex-grow focus:outline-none dark:bg-black dark:text-white bg-transparent text-gray-700"
              placeholder="What's on your mind?"
              id="search-box"
            />
          </div>

          <div
            className="flex flex-col w-1/2 space-y-2 justify-center mt-8 sm:space-y-0 sm:flex-row sm:space-x-4sm:flex-row"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
              gap: "1rem",
            }}
          >
            <div className="flex items-center pl-4 border border-gray-200 rounded dark:border-gray-700">
              <input
                id="bordered-checkbox-1"
                type="checkbox"
                checked={additionalFeature}
                onChange={() => setAdditionalFeature((prev) => !prev)}
                onClick={(e) => generateArticleTitle(e)}
                name="bordered-checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />

              <label
                htmlFor="bordered-checkbox-1"
                className="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer px-4"
              >
                Enable SEO & Clickbait Feature
              </label>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-2 mt-5">
                <DotsCircleHorizontalIcon className="h-3 animate-spin text-black-600 dark:text-gray-100" />
              </div>
            )}
          </div>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{ duration: 3000 }}
          />
          <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
          <ResizablePanel>
            <AnimatePresence mode="wait">
              <motion.div className="space-y-4 my-5">
                {generatedTitles && (
                  <>
                    <p className="text-sm text-center dark:text-gray-400 font-Ubuntu">
                      Click on any idea to copy it to your clipboard
                    </p>
                    <div className="space-y-3 flex flex-col items-center justify-center max-w-xl mx-auto sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:max-w-none lg:grid-cols-3 lg:max-w-full">
                      {generatedTitles
                        .match(/[0-9]+.[^0-9]+/g)
                        ?.map((generatedTitle, index) => {
                          return (
                            <div
                              className="bg-white dark:bg-gray-200  dark:text-gray-100 rounded-xl shadow-md p-2 hover:bg-gray-100 transition cursor-copy border"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedTitle);
                                toast.success("Title copied to clipboard");
                              }}
                              key={index}
                            >
                              <p className="dark:text-gray-800">
                                {generatedTitle
                                  .replace(/^"|"$|[0-9]+. /g, "")
                                  .trim()}
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
        </form>
        <Footer />
      </div>
    </>
  );
}
