/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
};

module.exports = {
  images: {
    domains: ["i.imgur.com", "www.google.com", "media.giphy.com"],
  },
};

const withPWA = require("next-pwa");

module.exports = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
});
