import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  // Note: Next.js automatically sets the lang attribute based on the current locale
  // when using i18n configuration in next.config.js
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://articleideagenerator.com" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* LLM-friendly content */}
        <link rel="llms" href="/llms.txt" />
        <link rel="llms-full" href="/llms-full.txt" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />

        <meta
          name="description"
          content="Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block and generate creative article ideas in seconds."
        />
        <meta
          name="keywords"
          content="article idea generator, article title generator, blog title generator, content ideas, SEO title generator, AI writing tool, writer's block, content creation, blog ideas, article headlines"
        />
        <meta name="author" content="Article Idea Generator" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Google / Search Engine Tags */}
        <meta
          itemProp="name"
          content="Article Idea Generator - Free AI Title Generator for Writers"
        />
        <meta
          itemProp="description"
          content="Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block and generate creative article ideas in seconds."
        />
        <meta property="og:site_name" content="Article Idea Generator" />
        <meta
          itemProp="image"
          content="https://articleideagenerator.com/og-image.png"
        />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://articleideagenerator.com" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Article Idea Generator - Free AI Title Generator for Writers"
        />
        <meta
          property="og:description"
          content="Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block and generate creative article ideas in seconds."
        />
        <meta
          property="og:image"
          content="https://articleideagenerator.com/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Article Idea Generator - AI-Powered Title Generation"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Article Idea Generator - Free AI Title Generator"
        />
        <meta
          name="twitter:description"
          content="Free AI-powered article title generator that creates SEO-optimized, engaging titles instantly. Beat writer's block with AI."
        />
        <meta
          name="twitter:image"
          content="https://articleideagenerator.com/og-image.png"
        />

        {/* Additional SEO */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Article Idea Generator" />
        <meta
          name="apple-mobile-web-app-title"
          content="Article Idea Generator"
        />

        {/* Hreflang tags for internationalization */}
        <link
          rel="alternate"
          hrefLang="en"
          href="https://articleideagenerator.com"
        />
        <link
          rel="alternate"
          hrefLang="fr"
          href="https://articleideagenerator.com/fr"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://articleideagenerator.com"
        />

        {/* Google Search Console - Replace with your verification code */}
        {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> */}
      </Head>
      <body className="transition-colors duration-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
