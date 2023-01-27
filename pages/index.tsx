import Head from "next/head";
import Avatar from "../components/Avatar";
import { SearchIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import ResizablePanel from "../components/ResizablePanel";

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
            content="Article Idea Generator built to help fix writers block"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* header */}
        <header className=" flex w-full p-5 justify-between text-sm text-gray-800">
          {/*left section*/}
          <div className="flex space-x-4 items-center font-Ubuntu"></div>

          {/*right section*/}
          <div className="flex space-x-4 font-Ubuntu items-center">
            <h1 className="font-bold">Star ⭐️ on GitHub</h1>
            <a href="https://github.com/Olanetsoft/article-idea-generator">
              <Avatar url="/github-icon.png" />
            </a>
          </div>
        </header>

        {/*body*/}
        <form
          onSubmit={(e) => generateArticleTitle(e)}
          className="flex flex-col items-center pt-3 w-4/5"
        >
          <Image
            src="/banner.gif"
            height={207}
            width={500}
            priority
            alt="Logo"
          />
          <div
            className="flex w-full mt-5 hover:shadow-lg focus-within:shadow-lg max-w-md rounded-full
      border border-gray-200 px-5 py-3 items-center sm:max-w-xl lg:max-w-2xl"
          >
            <SearchIcon className="h-5 mr-3 text-gray-700" />
            <label htmlFor="search" className="sr-only"></label>
            <input
              onChange={(e) => setText(e.target.value)}
              type="text"
              className="flex-grow focus:outline-none"
              placeholder="What's on your mind?"
              id="search"
            />
          </div>

          <div
            className="flex flex-col  w-1/2 space-y-2  justify-center  mt-8 sm:space-y-0 sm:flex-row sm:space-x-4sm:flex-row"
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              className="btn flex w-fit gap-3 items-center "
            >
              <input
                type="checkbox"
                checked={additionalFeature}
                onChange={() => setAdditionalFeature((prev) => !prev)}
                onClick={(e) => generateArticleTitle(e)}
              />
              <span> Enable SEO and Clickbait Feature</span>
            </button>

            {loading && (
              <div className="flex flex-col items-center gap-2 mt-5">
                <Image
                  src="/loading.gif"
                  height={50}
                  width={70}
                  priority
                  alt="Loading"
                />
              </div>
            )}
          </div>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{ duration: 2000 }}
          />
          <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
          <ResizablePanel>
            <AnimatePresence mode="wait">
              <motion.div className="space-y-5 my-5">
                {generatedTitles && (
                  <>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 font-Ubuntu">
                      Click on any idea to copy it to your clipboard
                    </p>
                    <div className="space-y-3 flex flex-col items-center justify-center max-w-xl mx-auto sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:max-w-none lg:grid-cols-3 lg:max-w-full">
                      {generatedTitles
                        .match(/[0-9]+.[^0-9]+/g)
                        ?.map((generatedTitle, index) => {
                          return (
                            <div
                              className="bg-white rounded-xl shadow-md p-2 hover:bg-gray-100 transition cursor-copy border"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedTitle);
                                toast.success("Title copied to clipboard");
                              }}
                              key={index}
                            >
                              <p>{generatedTitle.replace(/[0-9]+. /g, "")}</p>
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
