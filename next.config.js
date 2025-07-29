const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Simplified runtime caching to avoid conflicts
  runtimeCaching: [],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

module.exports = withPWA(nextConfig);
