import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in all environments for testing
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
        },
        cacheKeyWillBeUsed: async ({ request }) => {
          return `${request.url}?${Math.round(Date.now() / (1000 * 60 * 60 * 24))}`;
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gstatic-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests from local network IPs during development
  allowedDevOrigins: [
    'localhost:3001',
    '127.0.0.1:3001',
    '192.168.1.4:3001', // Your specific IP
    // Add your local network IP range
    '192.168.1.0/24', // This covers 192.168.1.1 to 192.168.1.254
    '192.168.0.0/24', // Common alternative range
    '10.0.0.0/8',     // Common home network range
    '172.16.0.0/12',  // Another common range
  ],
};

export default withPWA(nextConfig);
