/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["i.imgur.com", "www.google.com", "media.giphy.com"],
  },
  ...withPWA({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
    skipWaiting: true,
  }),
};
