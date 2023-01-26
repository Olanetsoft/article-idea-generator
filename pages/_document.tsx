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
        <meta property="og:site_name" content="articleideagenerator.com" />
        <meta
          property="og:description"
          content="Generate your next article idea with ease."
        />
        <meta property="og:title" content="Article Idea Generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Article Idea Generator" />
        <meta
          name="twitter:description"
          content="Generate your next article idea with ease."
        />
        <meta
          property="og:image"
          content="articleideagenerator.com/og-image.png"
        />
        <meta
          name="twitter:image"
          content="articleideagenerator.com/og-image.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
