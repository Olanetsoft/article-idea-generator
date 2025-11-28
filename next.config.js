/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
];

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["i.imgur.com", "www.google.com", "media.giphy.com"],
  },
  // Internationalization configuration
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    localeDetection: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  ...withPWA({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
    skipWaiting: true,
  }),
};
