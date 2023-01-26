import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Generate your next article idea with ease."
        />

        {/* <!-- Google / Search Engine Tags --> */}
        <meta itemProp="name" content="Article Idea Generator" />
        <meta
          itemProp="description"
          content="Generate your next article idea with ease."
        />
        <meta
          itemProp="image"
          content="http://article-idea-generator.vercel.app/articleideagenerator.com/og-image.png"
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta
          property="og:url"
          content="https://www.articleideagenerator.com"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Article Idea Generator" />
        <meta
          property="og:description"
          content="Generate your next article idea with ease."
        />
        <meta
          property="og:image"
          content="http://article-idea-generator.vercel.app/articleideagenerator.com/og-image.png"
        />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Article Idea Generator" />
        <meta
          name="twitter:description"
          content="Generate your next article idea with ease."
        />
        <meta
          name="twitter:image"
          content="http://article-idea-generator.vercel.app/articleideagenerator.com/og-image.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
