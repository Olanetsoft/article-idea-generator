import Head from "next/head";
import Avatar from "../components/Avatar";
import { SearchIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useState } from "react";

import Footer from "../components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [additionalFeature, setAdditionalFeature] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [text, setText] = useState("");

  const prompt =
    additionalFeature === true
      ? `Generate 4 article title for ${text}. Ensure its SEO friendly titles with clickbait`
      : `Generate 4 article title for ${text}`;

  const generateArticleTitle = async (e: any) => {
    e.preventDefault();

    setGeneratedTitle("");
    setLoading(true);

    console.log("prompt:", prompt);

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
    console.log("response: ", response);

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

      setGeneratedTitle((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  interface Props {
    generatedTitle: string;
  }

  const Component: React.FC<Props> = ({ generatedTitle }) => {
    const sections = generatedTitle.split(/([0-9]+.)/).filter(Boolean);
    return (
      <div className="w-full max-w-xl rounded overflow-hidden shadow-lg mt-5">
        {sections.map((section, i) => (
          <p
            className="px-4 py-1 text-gray-700 text-lg font-Ubuntu p-4"
            key={i}
          >
            {section
              .replace(/[0-9]+./g, "")
              .trim()
              .replace(/"/g, "")}
          </p>
        ))}
      </div>
    );
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
            <a href="https://github.com/Olanetsoft/article-idea-generator">
              <Avatar url="/github-brands.png" />
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

            <input
              onChange={(e) => setText(e.target.value)}
              type="text"
              className="flex-grow focus:outline-none"
              placeholder="Enter anything you want to write about"
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
          <div className="flex flex-col items-center gap-2 mt-3">
            {generatedTitle && <Component generatedTitle={generatedTitle} />}
          </div>
        </form>

        <Footer />
      </div>
    </>
  );
}
